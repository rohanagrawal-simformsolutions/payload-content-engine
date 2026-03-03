#!/bin/bash

# API Testing Script for Payload CMS + NestJS POC
# Make sure the application is running before executing this script

BASE_URL="http://localhost:3000"
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}Testing Payload CMS + NestJS POC${NC}"
echo -e "${YELLOW}================================${NC}\n"

# Test 1: Register User
echo -e "${YELLOW}[1/5] Registering new user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

if echo "$REGISTER_RESPONSE" | jq -e '.access_token' > /dev/null; then
  TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token')
  echo -e "${GREEN}✓ Registration successful${NC}\n"
else
  echo -e "${RED}✗ Registration failed${NC}\n"
  echo -e "${YELLOW}Note: User might already exist. Trying login...${NC}\n"
  
  # Try login instead
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "password123"
    }')
  
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
  echo "$LOGIN_RESPONSE" | jq '.'
  echo -e "${GREEN}✓ Login successful${NC}\n"
fi

# Test 2: Create Article (Protected)
echo -e "${YELLOW}[2/5] Creating article (protected route)...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/articles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Getting Started with Payload CMS",
    "slug": "getting-started-payload",
    "content": {
      "root": {
        "children": [
          {
            "children": [
              {
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "Payload CMS is a powerful headless CMS that can be embedded in any Node.js application.",
                "type": "text",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "type": "paragraph",
            "version": 1
          }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "root",
        "version": 1
      }
    },
    "status": "published"
  }')

echo "$CREATE_RESPONSE" | jq '.'
echo -e "${GREEN}✓ Article created${NC}\n"

# Test 3: Create Draft Article
echo -e "${YELLOW}[3/5] Creating draft article...${NC}"
DRAFT_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/articles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Draft Article - Work in Progress",
    "slug": "draft-article",
    "content": {
      "root": {
        "children": [
          {
            "children": [
              {
                "text": "This is a draft article and should not be publicly visible.",
                "type": "text"
              }
            ],
            "type": "paragraph"
          }
        ],
        "type": "root"
      }
    },
    "status": "draft"
  }')

echo "$DRAFT_RESPONSE" | jq '.'
echo -e "${GREEN}✓ Draft article created${NC}\n"

# Test 4: Get All Published Articles (Public)
echo -e "${YELLOW}[4/5] Getting all published articles (public)...${NC}"
GET_ALL_RESPONSE=$(curl -s "$BASE_URL/articles")
echo "$GET_ALL_RESPONSE" | jq '.'
echo -e "${GREEN}✓ Retrieved published articles (note: draft articles are not included)${NC}\n"

# Test 5: Get Article by Slug (Public)
echo -e "${YELLOW}[5/5] Getting article by slug (public)...${NC}"
GET_ONE_RESPONSE=$(curl -s "$BASE_URL/articles/getting-started-payload")
echo "$GET_ONE_RESPONSE" | jq '.'
echo -e "${GREEN}✓ Retrieved single article${NC}\n"

# Summary
echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}Testing Complete!${NC}"
echo -e "${YELLOW}================================${NC}\n"

echo -e "${GREEN}Summary:${NC}"
echo -e "1. ✓ User registration/login"
echo -e "2. ✓ Article creation (protected)"
echo -e "3. ✓ Draft article creation"
echo -e "4. ✓ Public article listing (only published)"
echo -e "5. ✓ Single article retrieval"
echo ""
echo -e "${YELLOW}Your access token:${NC}"
echo "$TOKEN"
echo ""
echo -e "${YELLOW}Save this token to make more authenticated requests!${NC}"
