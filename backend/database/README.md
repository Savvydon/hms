# Database setup

For a new database, the FastAPI application creates the SQLAlchemy tables at startup.

For an existing production database, use Alembic migrations rather than relying on `create_all`.
The current application changes authentication/administration behavior but does not require a new table for the core admin panel.
