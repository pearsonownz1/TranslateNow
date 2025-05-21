# OpenEval - Credential Evaluation & Translation Services

OpenEval is a comprehensive web platform that provides credential evaluation and translation services for academic, immigration, legal, and business purposes. The platform allows users to request quotes, upload documents, make payments, and track their orders through a user-friendly dashboard.

## 🚀 Features

### For Customers
- **Translation Services**: Document translation with various service options
- **Credential Evaluation**: Educational credential evaluation for US equivalency
- **User Dashboard**: Track orders, quotes, and manage account settings
- **Multiple Payment Options**: Secure payment processing via Stripe
- **Document Management**: Upload and manage documents for translation/evaluation

### For Partners & Integrations
- **API Access**: Submit credential evaluation requests programmatically
- **Webhook Notifications**: Receive updates when evaluations are completed
- **Clio Integration**: Connect with the Clio legal practice management system

### For Administrators
- **Admin Dashboard**: Manage orders, quotes, and users
- **Quote Management**: Review, price, and respond to quote requests
- **Document Processing**: Download submitted documents and upload completed translations
- **Invoicing**: Generate invoices for API partners via Invoiced.com integration

## 🛠️ Technology Stack

- **Frontend**: React with TypeScript
- **UI Framework**: TailwindCSS with shadcn/ui components
- **Backend**: Serverless API routes (Vercel Functions)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Payment Processing**: Stripe
- **Invoicing**: Invoiced.com
- **Deployment**: Vercel

## 📁 Project Structure

```
/
├── api/                    # Serverless API endpoints
│   ├── admin/              # Admin-only endpoints
│   ├── v1/                 # Public API endpoints
│   ├── clio/               # Clio integration endpoints
│   └── _lib/               # Shared API utilities
├── public/                 # Static assets
│   ├── images/             # Image assets
│   └── logos/              # Logo files
├── src/
│   ├── components/         # React components
│   │   ├── admin/          # Admin dashboard components
│   │   ├── api/            # API documentation components
│   │   ├── auth/           # Authentication components
│   │   ├── checkout/       # Checkout flow components
│   │   ├── dashboard/      # User dashboard components
│   │   ├── landing/        # Landing page components
│   │   ├── solutions/      # Service-specific pages
│   │   └── ui/             # Reusable UI components
│   ├── lib/                # Utility functions and shared code
│   ├── stories/            # Storybook component stories
│   └── types/              # TypeScript type definitions
└── supabase/
    ├── functions/          # Supabase Edge Functions
    └── migrations/         # Database migration scripts
```

## 🔑 Key Features Explained

### Translation Service Flow
1. Users select document type, languages, and service options
2. Users upload documents and provide contact information
3. Admins review and provide a quote
4. Users make payment via Stripe
5. Admins process the translation and upload completed documents
6. Users receive notification and can download completed translations

### Credential Evaluation Flow
1. Users provide details about their education and credentials
2. Users upload supporting documentation
3. Admins review and evaluate the credentials
4. Admins provide US equivalency or rejection reason
5. Users receive notification with evaluation results

### API Integration
Partners can integrate with OpenEval to programmatically submit credential evaluation requests:
1. Partners obtain API key from their dashboard
2. Partners submit requests via the API
3. OpenEval processes the evaluation
4. Partners receive webhook notification with results
5. Periodic invoicing for API usage

## 🔧 Development Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Supabase account
- Stripe account
- Invoiced.com account (for admin invoicing)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/TranslateNow.git
cd TranslateNow
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
INVOICED_API_KEY=your_invoiced_api_key
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

## 🚢 Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure the environment variables in Vercel's dashboard
3. Deploy the application

## 📝 API Documentation

The API documentation is available at `/api-docs` when the application is running. It includes:

- Authentication instructions
- Endpoint details
- Request/response examples
- Webhook integration guide

## 🔒 Security Considerations

- API keys are hashed before storage
- Webhook payloads are signed with HMAC for verification
- File uploads are secured with signed URLs
- Role-based access control for admin functions
- Environment variables for sensitive credentials

## 🤝 Third-Party Integrations

- **Stripe**: Payment processing
- **Invoiced.com**: Invoice generation and management
- **Clio**: Legal practice management integration
- **Supabase**: Database, authentication, and storage

## 📄 License

[Your License Information]

## 👥 Contributors

[Your Contributor Information]
