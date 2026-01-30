#!/bin/bash

# Configuration
API_BASE="http://localhost:4000/api"
ADMIN_KEY="${ADMIN_KEY:-<your-admin-key-from-env>}"
ADMIN_IDENTITY="test-admin"
COOKIE_JAR="/tmp/god-complex-test-cookies.txt"

# Helper function to make authenticated requests (using cookies)
auth_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X "$method" "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -b "$COOKIE_JAR" \
            -c "$COOKIE_JAR" \
            -d "$data"
    else
        curl -s -X "$method" "$API_BASE$endpoint" \
            -b "$COOKIE_JAR" \
            -c "$COOKIE_JAR"
    fi
}

# Admin request helper
admin_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X "$method" "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -H "x-admin-key: $ADMIN_KEY" \
            -H "x-admin-identity: $ADMIN_IDENTITY" \
            -b "$COOKIE_JAR" \
            -c "$COOKIE_JAR" \
            -d "$data"
    else
        curl -s -X "$method" "$API_BASE$endpoint" \
            -H "x-admin-key: $ADMIN_KEY" \
            -H "x-admin-identity: $ADMIN_IDENTITY" \
            -b "$COOKIE_JAR" \
            -c "$COOKIE_JAR"
    fi
}

# Sign up and authenticate a new user (stores session cookie)
signup_user() {
    local email=$1
    local password=$2
    local name=$3
    
    # Clear old cookies
    rm -f "$COOKIE_JAR"
    
    curl -s -X POST "$API_BASE/auth/sign-up/email" \
        -H "Content-Type: application/json" \
        -c "$COOKIE_JAR" \
        -d "{\"email\": \"$email\", \"password\": \"$password\", \"name\": \"$name\"}"
}

# Sign in an existing user
signin_user() {
    local email=$1
    local password=$2
    
    curl -s -X POST "$API_BASE/auth/sign-in/email" \
        -H "Content-Type: application/json" \
        -c "$COOKIE_JAR" \
        -d "{\"email\": \"$email\", \"password\": \"$password\"}"
}

# Export functions
export -f auth_request
export -f admin_request
export -f signup_user
export -f signin_user
export COOKIE_JAR
export API_BASE
export ADMIN_KEY
export ADMIN_IDENTITY
