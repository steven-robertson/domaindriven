using SteveR.Auth.Model;

namespace SteveR.Auth.Repositories;

public class UserRepository
{
    private readonly IConfiguration _configuration;
    
    private string DefaultRole => _configuration["JWT:DefaultRole"];

    private bool AddDefaultRole => _configuration["JWT:AddDefaultRole"] != null && bool.Parse(_configuration["JWT:AddDefaultRole"]);

    public UserRepository(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    private GraphQlClient GetGraphQlClient()
    {
        var endpoint = _configuration["GraphQL:Endpoint"];
        var secret = _configuration["GraphQL:AdminSecret"];
        var headers = new Dictionary<string, string> { { "X-Hasura-Admin-Secret", secret } };
        return new GraphQlClient(endpoint, headers);
    }
    
    protected string? GetDefaultRole()
    {
        return AddDefaultRole ? DefaultRole : null; 
    }

    /// <summary>
    /// Creates a new user entry in the database for the given username.
    /// </summary>
    /// <param name="username">Unique username for the user.</param>
    public async Task CreateUser(string username)
    {
        if (username == null)
        {
            throw new ArgumentNullException(nameof(username));
        }

        username = username.Trim();
        
        if (username.Length == 0)
        {
            throw new Exception("Invalid username");
        }
    
        // Query to create new user record. 
        var client = GetGraphQlClient();
        var query = await File.ReadAllTextAsync(Path.Combine("GraphQL", "CreateUser.graphql"));
        var result = await client.Query(query, new { username });
        result.EnsureNoErrors();
    }

    /// <param name="username">Unique username for the requested User entity.</param>
    /// <returns>
    /// User entity for the given username, or null.
    /// </returns>
    public async Task<User?> GetUser(string username)
    {
        // Query for user given username.
        var client = GetGraphQlClient();
        var query = await File.ReadAllTextAsync(Path.Combine("GraphQL", "GetUser.graphql"));
        var result = await client.Query(query, new { username });
        result.EnsureNoErrors();
        
        var users = result.Get<User[]>("user");

        if (users == null || users.Length == 0)
        {
            return null;
        }

        if (users.Length > 1)
        {
            throw new Exception("Unexpected number of query results");
        }

        return users[0];
    }

    /// <param name="username">Username to lookup in database.</param>
    /// <returns>
    /// True if the user is registered in the database, otherwise false.
    /// </returns>
    public async Task<bool> UserExists(string username)
    {
        return await GetUser(username) != null;
    }

    public async Task<List<string>> GetRoles(string userId)
    {
        // Always add a "user" role.
        var roles = new List<string>();

        if (AddDefaultRole)
        {
            var defaultRole = GetDefaultRole();
            if (defaultRole != null)
            {
                roles.Add(defaultRole);
            }
        }

        // Query for user roles given user ID.
        var client = GetGraphQlClient();
        var query = await File.ReadAllTextAsync(Path.Combine("GraphQL", "GetUserRoles.graphql"));
        var result = await client.Query(query, new { user_id = userId });
        result.EnsureNoErrors();

        var users = result.Get<User[]>("user");

        if (users == null || users.Length != 1)
        {
            throw new InvalidOperationException();
        }

        var user = users[0];

        if (user.UserRoles != null)
        {
            foreach (var role in user.UserRoles)
            {
                if (role.Role?.Name != null)
                {
                    roles.Add(role.Role.Name);
                }
            }
        }

        return roles;
    }
}