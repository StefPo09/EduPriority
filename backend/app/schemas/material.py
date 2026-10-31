from pydantic import BaseModel, Field, AliasChoices, ConfigDict

class MaterialOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    name: str
    subject: str
    className: str = Field(
        ...,
        validation_alias=AliasChoices("className", "class_name"),
        serialization_alias="className",
    )
    type: str
    size: str
    icon: str
