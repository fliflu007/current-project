EditCard
│
├── Form handling
│ ├── RHF
│ ├── Zod
│ └── product fields
│
└── ImageSelector
├── file input
├── image validation
├── add images
└── image state

### Data flow

GET /api/product/[id]
↓
ProductByIdAPI
↓
Edit Page (Server Component)
↓
EditCard (Client Component)
↓
RHF + ProductImage[]
↓
User edits
↓
PATCH /api/product/[id]
↓
Service
↓
Database
