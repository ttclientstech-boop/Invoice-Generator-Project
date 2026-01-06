import { z } from 'zod';

export const serviceCategories = [
    'Web & Software Dev',
    'Mobile App Dev',
    'Blockchain & Web3',
    'AI-driven Solutions',
    'SaaS Development',
    'Other'
] as const;

// --- Sub-Schemas for Dynamic Fields ---

const webDevSchema = z.object({
    applicationType: z.enum(['Static', 'Dynamic', 'Web App', 'Enterprise']),
    pagesModules: z.coerce.number().min(1, "At least 1 page/module required"),
    authRequirements: z.boolean(),
    adminDashboard: z.boolean(),
    thirdPartyIntegration: z.boolean(),
});

const mobileDevSchema = z.object({
    targetPlatform: z.enum(['Android', 'iOS', 'Both']),
    approach: z.enum(['Native', 'Cross-platform']),
    features: z.array(z.string()).optional(), // Multi-select
    offlineSupport: z.boolean(),
});

// ... (We can expand other categories strictly or use a loose schema for now to avoid over-engineering initially, 
// but the prompt asked for specific fields, so I will define them)

const blockchainSchema = z.object({
    platform: z.string().min(1, "Platform required"),
    smartContract: z.boolean(),
    walletIntegration: z.boolean(),
    tokenNftDev: z.boolean(),
    securityAudit: z.boolean(),
});

const aiSchema = z.object({
    category: z.enum(['ML', 'NLP', 'Computer Vision']),
    datasetAvailability: z.string().optional(),
    modelComplexity: z.enum(['Low', 'Mid', 'High']),
    processingType: z.enum(['Real-time', 'Batch']),
});

const saasSchema = z.object({
    userRoles: z.string().optional(),
    subscriptionModel: z.string().optional(),
    multiTenancy: z.boolean(),
    analytics: z.boolean(),
    paymentGateway: z.boolean(),
});

// --- Main Schemas ---

export const clientSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(1, "Zip Code is required"),
    country: z.string().min(1, "Country is required"),
});

export const serviceItemSchema = z.object({
    serviceCategory: z.enum(serviceCategories),
    description: z.string().optional(), // Can be auto-generated or manually edited
    quantity: z.coerce.number().min(1).default(1),
    price: z.coerce.number().min(0, "Price cannot be negative"),

    // This is where it gets dynamic. We'll use a union or just a comprehensive optional object for simplicity in the UI form
    // Strict unions can be tricky with react-hook-form without complex discrimination. 
    // We'll store all potential fields in a 'details' object that we validate loosely or manually based on category.
    details: z.object({
        // Web
        applicationType: z.enum(['Static', 'Dynamic', 'Web App', 'Enterprise']).optional(),
        pagesModules: z.coerce.number().optional(),
        authRequirements: z.boolean().optional(),
        adminDashboard: z.boolean().optional(),
        thirdPartyIntegration: z.boolean().optional(),

        // Mobile
        targetPlatform: z.enum(['Android', 'iOS', 'Both']).optional(),
        approach: z.enum(['Native', 'Cross-platform']).optional(),
        features: z.array(z.string()).optional(),
        offlineSupport: z.boolean().optional(),

        // Blockchain
        platform: z.string().optional(),
        smartContract: z.boolean().optional(),
        walletIntegration: z.boolean().optional(),
        tokenNftDev: z.boolean().optional(),
        securityAudit: z.boolean().optional(),

        // AI
        category: z.enum(['ML', 'NLP', 'Computer Vision']).optional(),
        datasetAvailability: z.string().optional(),
        modelComplexity: z.enum(['Low', 'Mid', 'High']).optional(),
        processingType: z.enum(['Real-time', 'Batch']).optional(),

        // SaaS
        userRoles: z.string().optional(),
        subscriptionModel: z.string().optional(),
        multiTenancy: z.boolean().optional(),
        analytics: z.boolean().optional(),
        paymentGateway: z.boolean().optional(),
    }).optional(),
});

export const settingsSchema = z.object({
    invoiceNumber: z.string().min(1, "Invoice number required"),
    date: z.coerce.date().default(() => new Date()),
    dueDate: z.coerce.date(),
    currency: z.string().default('USD'),
    taxRate: z.coerce.number().min(0).max(100).default(0),
    discount: z.coerce.number().min(0).default(0),
    paymentTerms: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['Draft', 'Sent']).default('Draft'),
    isPaid: z.boolean().default(false),
});

export const senderSchema = z.object({
    name: z.string().min(2, "Company Name is required"),
    email: z.string().email("Invalid email"),
    address: z.string().min(5, "Address is required"),
    phone: z.string().optional(),
    gstVatId: z.string().optional(),
    logo: z.string().optional(), // URL or base64
});

export const invoiceFormSchema = z.object({
    sender: senderSchema,
    client: clientSchema,
    items: z.array(serviceItemSchema).min(1, "Add at least one item"),
    settings: settingsSchema,
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
