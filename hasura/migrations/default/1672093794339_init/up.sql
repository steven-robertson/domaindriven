SET check_function_bodies = false;
CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;
CREATE TABLE public.audit (
    audit_id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL,
    table_name text NOT NULL,
    op text NOT NULL,
    json_data text NOT NULL,
    user_id uuid
);
COMMENT ON TABLE public.audit IS 'Logging events for model changes';
CREATE TABLE public.backup (
    backup_id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL,
    space_name text NOT NULL,
    model_name text NOT NULL,
    model_id uuid,
    user_id uuid,
    space_id uuid,
    model_json text NOT NULL
);
COMMENT ON TABLE public.backup IS 'Model backups';
CREATE TABLE public.connection (
    connection_id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_context_id uuid NOT NULL,
    to_context_id uuid NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL,
    model_id uuid NOT NULL
);
COMMENT ON TABLE public.connection IS 'Connections between contexts';
CREATE TABLE public.context (
    context_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL,
    notes text,
    model_id uuid NOT NULL
);
COMMENT ON TABLE public.context IS 'Bounded Context and Ubiquitous Language';
CREATE TABLE public.demoted (
    demoted_id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL,
    term_id uuid NOT NULL,
    demoted_name text NOT NULL,
    context_id uuid NOT NULL
);
COMMENT ON TABLE public.demoted IS 'Demoted terms';
CREATE TABLE public."group" (
    group_id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    context_id uuid NOT NULL
);
COMMENT ON TABLE public."group" IS 'Term groups for focusing on specific terms';
CREATE TABLE public.group_term (
    group_id uuid NOT NULL,
    term_id uuid NOT NULL
);
COMMENT ON TABLE public.group_term IS 'Term in grouped terms';
CREATE TABLE public.model (
    model_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL,
    space_id uuid
);
COMMENT ON TABLE public.model IS 'Domain Model';
CREATE TABLE public.model_viewer (
    model_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.model_viewer IS 'People currently viewing models';
CREATE TABLE public.multiplier (
    multiplier_id uuid DEFAULT gen_random_uuid() NOT NULL,
    symbol text NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.multiplier IS 'Multiplicity symbol on term relations';
CREATE TABLE public.relation (
    relation_id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_term_id uuid NOT NULL,
    to_term_id uuid NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL,
    context_id uuid NOT NULL,
    from_multiplier_id uuid,
    to_multiplier_id uuid
);
COMMENT ON TABLE public.relation IS 'Relation between terms';
CREATE TABLE public.role (
    role_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.role IS 'Role-based authorisation';
CREATE TABLE public.session (
    session_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    auth_token text NOT NULL,
    created timestamp(6) with time zone NOT NULL,
    updated timestamp(6) with time zone DEFAULT now() NOT NULL,
    expires timestamp(6) with time zone NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.session IS 'Session records for authenticated users';
CREATE TABLE public.space (
    space_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL,
    info text
);
COMMENT ON TABLE public.space IS 'Every person has a personal space and may have shared spaces for teamwork';
CREATE TABLE public.term (
    term_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    classname text NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL,
    context_id uuid NOT NULL,
    definition text,
    todo boolean DEFAULT true NOT NULL,
    enabled boolean DEFAULT true NOT NULL
);
COMMENT ON TABLE public.term IS 'A concept used in a Domain Model';
CREATE TABLE public.test (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL
);
CREATE TABLE public.text (
    text_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    lang text NOT NULL,
    text text NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.updated_model (
    model_id uuid NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL
);
COMMENT ON TABLE public.updated_model IS 'Timestamps for updated models';
CREATE TABLE public.updated_space (
    space_id uuid NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL
);
COMMENT ON TABLE public.updated_space IS 'Timestamps for updated spaces';
CREATE TABLE public."user" (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL,
    personal_space_id uuid,
    name text,
    fullname text,
    email text
);
COMMENT ON TABLE public."user" IS 'Authenticated user';
CREATE TABLE public.user_role (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.user_role IS 'Assigned roles for users';
CREATE TABLE public.user_space (
    user_id uuid NOT NULL,
    space_id uuid NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.user_space IS 'Spaces that a person has access to';
CREATE VIEW public.v_model_viewers AS
 SELECT model.name AS model_name,
    "user".name AS user_name,
    space.name AS space_name
   FROM (((public.model_viewer
     JOIN public.model ON ((model_viewer.model_id = model.model_id)))
     JOIN public."user" ON ((model_viewer.user_id = "user".user_id)))
     JOIN public.space ON ((model.space_id = space.space_id)))
  ORDER BY space.name, model.name, "user".name;
CREATE VIEW public.v_space_usercount AS
 SELECT space.name AS space_name,
    ( SELECT count(*) AS count
           FROM public.user_space
          WHERE (user_space.space_id = space.space_id)) AS user_count,
    space.space_id
   FROM public.space
  ORDER BY ( SELECT count(*) AS count
           FROM public.user_space
          WHERE (user_space.space_id = space.space_id)) DESC;
CREATE VIEW public.v_space_users AS
 SELECT space.name AS space_name,
    "user".name
   FROM ((public."user"
     JOIN public.user_space ON (("user".user_id = user_space.user_id)))
     JOIN public.space ON ((user_space.space_id = space.space_id)))
  ORDER BY space.name, "user".name;
ALTER TABLE ONLY public.audit
    ADD CONSTRAINT audit_pkey PRIMARY KEY (audit_id);
ALTER TABLE ONLY public.connection
    ADD CONSTRAINT connection_pkey PRIMARY KEY (connection_id);
ALTER TABLE ONLY public.demoted
    ADD CONSTRAINT demoted_pkey PRIMARY KEY (demoted_id);
ALTER TABLE ONLY public."group"
    ADD CONSTRAINT group_name_project_id_key UNIQUE (name, context_id);
ALTER TABLE ONLY public."group"
    ADD CONSTRAINT group_pkey PRIMARY KEY (group_id);
ALTER TABLE ONLY public.group_term
    ADD CONSTRAINT group_term_pkey PRIMARY KEY (group_id, term_id);
ALTER TABLE ONLY public.model
    ADD CONSTRAINT model_pkey PRIMARY KEY (model_id);
ALTER TABLE ONLY public.model_viewer
    ADD CONSTRAINT model_viewer_pkey PRIMARY KEY (model_id, user_id);
ALTER TABLE ONLY public.multiplier
    ADD CONSTRAINT multiplier_pkey PRIMARY KEY (multiplier_id);
ALTER TABLE ONLY public.backup
    ADD CONSTRAINT project_backup_pkey PRIMARY KEY (backup_id);
ALTER TABLE ONLY public.context
    ADD CONSTRAINT projects_pkey PRIMARY KEY (context_id);
ALTER TABLE ONLY public.relation
    ADD CONSTRAINT relation_pkey PRIMARY KEY (relation_id);
ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_name_key UNIQUE (name);
ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (role_id);
ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_auth_token_key UNIQUE (auth_token);
ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (session_id);
ALTER TABLE ONLY public.space
    ADD CONSTRAINT team_pkey PRIMARY KEY (space_id);
ALTER TABLE ONLY public.term
    ADD CONSTRAINT term_name_project_id_key UNIQUE (name, context_id);
ALTER TABLE ONLY public.term
    ADD CONSTRAINT term_pkey PRIMARY KEY (term_id);
ALTER TABLE ONLY public.test
    ADD CONSTRAINT test_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.text
    ADD CONSTRAINT text_name_lang_key UNIQUE (name, lang);
ALTER TABLE ONLY public.text
    ADD CONSTRAINT text_pkey PRIMARY KEY (text_id);
ALTER TABLE ONLY public.updated_model
    ADD CONSTRAINT updated_model_pkey PRIMARY KEY (model_id);
ALTER TABLE ONLY public.updated_space
    ADD CONSTRAINT updated_space_pkey PRIMARY KEY (space_id);
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (user_id);
ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (user_id, role_id);
ALTER TABLE ONLY public.user_space
    ADD CONSTRAINT user_team_pkey PRIMARY KEY (user_id, space_id);
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_username_key UNIQUE (username);
CREATE TRIGGER set_public_model_viewer_updated_at BEFORE UPDATE ON public.model_viewer FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_model_viewer_updated_at ON public.model_viewer IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_public_text_updated_at BEFORE UPDATE ON public.text FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_text_updated_at ON public.text IS 'trigger to set value of column "updated_at" to current timestamp on row update';
ALTER TABLE ONLY public.audit
    ADD CONSTRAINT audit_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON UPDATE SET NULL ON DELETE SET NULL;
ALTER TABLE ONLY public.backup
    ADD CONSTRAINT backup_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.model(model_id) ON UPDATE SET NULL ON DELETE SET NULL;
ALTER TABLE ONLY public.backup
    ADD CONSTRAINT backup_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON UPDATE SET NULL ON DELETE SET NULL;
ALTER TABLE ONLY public.connection
    ADD CONSTRAINT connection_from_context_id_fkey FOREIGN KEY (from_context_id) REFERENCES public.context(context_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.connection
    ADD CONSTRAINT connection_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.model(model_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.connection
    ADD CONSTRAINT connection_to_context_id_fkey FOREIGN KEY (to_context_id) REFERENCES public.context(context_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.context
    ADD CONSTRAINT context_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.model(model_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.demoted
    ADD CONSTRAINT demoted_model_id_fkey FOREIGN KEY (context_id) REFERENCES public.context(context_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.demoted
    ADD CONSTRAINT demoted_term_id_fkey FOREIGN KEY (term_id) REFERENCES public.term(term_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public."group"
    ADD CONSTRAINT group_project_id_fkey FOREIGN KEY (context_id) REFERENCES public.context(context_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.group_term
    ADD CONSTRAINT group_term_group_id_fkey FOREIGN KEY (group_id) REFERENCES public."group"(group_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.group_term
    ADD CONSTRAINT group_term_term_id_fkey FOREIGN KEY (term_id) REFERENCES public.term(term_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.model
    ADD CONSTRAINT model_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.space(space_id) ON UPDATE SET NULL ON DELETE SET NULL;
ALTER TABLE ONLY public.model_viewer
    ADD CONSTRAINT model_viewer_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.model(model_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.model_viewer
    ADD CONSTRAINT model_viewer_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.backup
    ADD CONSTRAINT project_backup_team_id_fkey FOREIGN KEY (space_id) REFERENCES public.space(space_id) ON UPDATE SET NULL ON DELETE SET NULL;
ALTER TABLE ONLY public.relation
    ADD CONSTRAINT relation_from_multiplier_id_fkey FOREIGN KEY (from_multiplier_id) REFERENCES public.multiplier(multiplier_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.relation
    ADD CONSTRAINT relation_from_term_id_fkey FOREIGN KEY (from_term_id) REFERENCES public.term(term_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.relation
    ADD CONSTRAINT relation_project_id_fkey FOREIGN KEY (context_id) REFERENCES public.context(context_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.relation
    ADD CONSTRAINT relation_to_multiplier_id_fkey FOREIGN KEY (to_multiplier_id) REFERENCES public.multiplier(multiplier_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.relation
    ADD CONSTRAINT relation_to_term_id_fkey FOREIGN KEY (to_term_id) REFERENCES public.term(term_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.term
    ADD CONSTRAINT term_project_id_fkey FOREIGN KEY (context_id) REFERENCES public.context(context_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.updated_model
    ADD CONSTRAINT updated_model_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.model(model_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.updated_space
    ADD CONSTRAINT updated_space_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.space(space_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_primary_team_id_fkey FOREIGN KEY (personal_space_id) REFERENCES public.space(space_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(role_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.user_space
    ADD CONSTRAINT user_space_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.user_space
    ADD CONSTRAINT user_team_team_id_fkey FOREIGN KEY (space_id) REFERENCES public.space(space_id) ON UPDATE CASCADE ON DELETE CASCADE;
