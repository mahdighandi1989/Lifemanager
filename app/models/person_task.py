"""person_tasks — M2M association between Person and Task (audit task 3cc09436, AC2).

Links the people a task involves to the task itself, so a task like
"تماس با علی" can be associated with the علی person profile. Defined as an
association Table on Base.metadata so create_all + the alembic chain both
materialise it.
"""
from sqlalchemy import Column, ForeignKey, Integer, Table

from app.database import Base

person_tasks = Table(
    "person_tasks",
    Base.metadata,
    Column("person_id", Integer, ForeignKey("persons.id", ondelete="CASCADE"), primary_key=True),
    Column("task_id", Integer, ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
)
