from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
from starlette.responses import JSONResponse
from app.routes.clone import clone
from app.routes.model_changed import model_changed
from app.routes.new_user import new_user
from app.routes.remove_model_viewers import remove_model_viewers
from app.routes.restore import restore
from app.routes.new_space import new_space


app = FastAPI()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": exc.errors(), "body": exc.body}),
    )


app.include_router(clone, prefix='/clone')
app.include_router(model_changed, prefix='/model_changed')
app.include_router(new_user, prefix='/new_user')
app.include_router(new_space, prefix='/new_space')
app.include_router(remove_model_viewers, prefix='/remove_model_viewers')
app.include_router(restore, prefix='/restore')
