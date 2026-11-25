companies

├── id UUID PK DEFAULT generated UUID
├── name text NOT NULL
└── created_at timestamptz NOT NULL DEFAULT now()

profiles

├── id UUID PK → auth.users.id
├── company_id UUID NOT NULL → companies.id
├── role text NOT NULL CHECK: admin | staff | viewer
└── created_at timestamptz NOT NULL DEFAULT now()

products

├── id UUID PK DEFAULT generated UUID
├── company_id UUID NOT NULL → companies.id
├── created_at timestamptz NOT NULL DEFAULT now()
├── archived_at timestamptz NULL
├── name text NOT NULL
├── description text NULL
└── quantity numeric NOT NULL DEFAULT 0

inventory_movements

├── id UUID PK DEFAULT generated UUID
├── product_id UUID NOT NULL → products.id // index
├── type text NOT NULL CHECK: IN | OUT
├── created_at timestamptz NOT NULL DEFAULT now()
├── quantity numeric NOT NULL CHECK: quantity > 0
└── comment text NULL

product_images

├── id UUID PK DEFAULT generated UUID
├── product_id UUID NOT NULL → products.id
├── url text NOT NULL
├── is_primary boolean NOT NULL DEFAULT false  
└── created_at timestamptz NOT NULL DEFAULT now()
