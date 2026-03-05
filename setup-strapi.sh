#!/bin/bash

# Setup script for Strapi integration with existing Payload CMS

echo "=== Strapi Integration Setup ==="
echo ""

set_or_append_env() {
    local file="$1"
    local key="$2"
    local value="$3"
    if grep -q "^${key}=" "$file"; then
        sed -i "s|^${key}=.*|${key}=${value}|" "$file"
    else
        echo "${key}=${value}" >> "$file"
    fi
}

# PostgreSQL config for Strapi (can be overridden via environment variables)
STRAPI_DB_HOST="${STRAPI_DB_HOST:-127.0.0.1}"
STRAPI_DB_PORT="${STRAPI_DB_PORT:-5432}"
STRAPI_DB_NAME="${STRAPI_DB_NAME:-payload_nestjs}"
STRAPI_DB_USER="${STRAPI_DB_USER:-postgres}"
STRAPI_DB_PASSWORD="${STRAPI_DB_PASSWORD:-postgres123}"
STRAPI_DB_SSL="${STRAPI_DB_SSL:-false}"
STRAPI_DB_SCHEMA="${STRAPI_DB_SCHEMA:-strapi}"

# Check if Strapi directory exists
if [ ! -d "strapi-poc" ]; then
    echo "📦 Creating Strapi project..."
        npx create-strapi-app@latest strapi-poc \
            --no-run \
            --skip-cloud \
            --non-interactive \
            --dbclient postgres \
            --dbhost "$STRAPI_DB_HOST" \
            --dbport "$STRAPI_DB_PORT" \
            --dbname "$STRAPI_DB_NAME" \
            --dbusername "$STRAPI_DB_USER" \
            --dbpassword "$STRAPI_DB_PASSWORD" \
            --dbssl "$STRAPI_DB_SSL"

        # Ensure Strapi uses its own PostgreSQL schema in shared database
        if [ -f "strapi-poc/.env" ]; then
            if grep -q '^DATABASE_SCHEMA=' "strapi-poc/.env"; then
                sed -i "s/^DATABASE_SCHEMA=.*/DATABASE_SCHEMA=$STRAPI_DB_SCHEMA/" "strapi-poc/.env"
            else
                echo "DATABASE_SCHEMA=$STRAPI_DB_SCHEMA" >> "strapi-poc/.env"
            fi
        fi

        # Create schema if psql is available
        if command -v psql >/dev/null 2>&1; then
            echo "🗂️  Creating PostgreSQL schema '$STRAPI_DB_SCHEMA' (if not exists)..."
            PGPASSWORD="$STRAPI_DB_PASSWORD" psql \
                -h "$STRAPI_DB_HOST" \
                -p "$STRAPI_DB_PORT" \
                -U "$STRAPI_DB_USER" \
                -d "$STRAPI_DB_NAME" \
                -c "CREATE SCHEMA IF NOT EXISTS \"$STRAPI_DB_SCHEMA\";" >/dev/null 2>&1 || true
        fi
else
    echo "✅ Strapi directory already exists"
fi

# Ensure Strapi project is configured for shared PostgreSQL with isolated schema
if [ -f "strapi-poc/.env" ]; then
    set_or_append_env "strapi-poc/.env" "DATABASE_CLIENT" "postgres"
    set_or_append_env "strapi-poc/.env" "DATABASE_HOST" "$STRAPI_DB_HOST"
    set_or_append_env "strapi-poc/.env" "DATABASE_PORT" "$STRAPI_DB_PORT"
    set_or_append_env "strapi-poc/.env" "DATABASE_NAME" "$STRAPI_DB_NAME"
    set_or_append_env "strapi-poc/.env" "DATABASE_USERNAME" "$STRAPI_DB_USER"
    set_or_append_env "strapi-poc/.env" "DATABASE_PASSWORD" "$STRAPI_DB_PASSWORD"
    set_or_append_env "strapi-poc/.env" "DATABASE_SSL" "$STRAPI_DB_SSL"
    set_or_append_env "strapi-poc/.env" "DATABASE_SCHEMA" "$STRAPI_DB_SCHEMA"
fi

echo ""
echo "📝 Environment Setup"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local..."
    cat > .env.local << 'EOF'
# Strapi Configuration
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_api_token_here
EOF
    echo "✅ .env.local created (update with your Strapi token)"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Start Strapi in a separate terminal:"
echo "   cd strapi-poc && npm run develop"
echo "   (Configured DB: $STRAPI_DB_NAME, schema: $STRAPI_DB_SCHEMA)"
echo ""
echo "2. Create Articles collection in Strapi admin (http://localhost:1337/admin):"
echo "   - Content-Type Builder → Create New Collection Type"
echo "   - Name: Articles"
echo "   - Add fields (see STRAPI_INTEGRATION.md for full schema)"
echo ""
echo "3. Generate API token in Strapi:"
echo "   - Settings → API Tokens → Create new API token"
echo "   - Copy token and add to .env.local"
echo ""
echo "4. Start this application:"
echo "   npm run start:dev  (backend)"
echo "   npm run frontend:dev  (frontend)"
echo ""
echo "5. Use CMS Switcher in navbar to test both Payload and Strapi"
echo ""
echo "📖 For detailed setup instructions, see STRAPI_INTEGRATION.md"
