import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY

// Create Supabase client (works even with demo values for local testing)
export const supabase = createClient(
    supabaseUrl || 'https://demo.supabase.co',
    supabaseKey || 'demo_key',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

// Demo data for local development without Supabase
export const demoData = {
    mfis: [
        { id: 1, slug: 'bangladesh-mfi', name: 'Grameen Climate Finance', country: 'Bangladesh', base_interest_rate: 18.5 },
        { id: 2, slug: 'kenya-mfi', name: 'M-Pesa Green Loans', country: 'Kenya', base_interest_rate: 22.0 },
        { id: 3, slug: 'peru-mfi', name: 'Banco Sol Verde', country: 'Peru', base_interest_rate: 19.5 }
    ],

    loanOfficers: [
        { id: 1, mfi_id: 1, username: 'officer1', password_hash: '$2a$10$demo', full_name: 'Fatima Rahman', role: 'loan_officer' },
        { id: 2, mfi_id: 2, username: 'officer2', password_hash: '$2a$10$demo', full_name: 'James Ochieng', role: 'loan_officer' },
        { id: 3, mfi_id: 3, username: 'officer3', password_hash: '$2a$10$demo', full_name: 'Maria Gonzales', role: 'loan_officer' },
        { id: 4, mfi_id: 1, username: 'manager1', password_hash: '$2a$10$demo', full_name: 'Ahmed Khan', role: 'manager' }
    ],

    climateZones: [
        { id: 1, region_name: 'Sylhet', country: 'Bangladesh', lat: 24.8949, lng: 91.8687, flood_risk: 0.72, drought_risk: 0.25, heatwave_risk: 0.45 },
        { id: 2, region_name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lng: 90.4125, flood_risk: 0.65, drought_risk: 0.28, heatwave_risk: 0.52 },
        { id: 3, region_name: 'Nyeri', country: 'Kenya', lat: -0.4167, lng: 36.9500, flood_risk: 0.35, drought_risk: 0.58, heatwave_risk: 0.40 },
        { id: 4, region_name: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, flood_risk: 0.42, drought_risk: 0.52, heatwave_risk: 0.38 },
        { id: 5, region_name: 'Cusco', country: 'Peru', lat: -13.5319, lng: -71.9675, flood_risk: 0.48, drought_risk: 0.42, heatwave_risk: 0.28 },
        { id: 6, region_name: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428, flood_risk: 0.22, drought_risk: 0.68, heatwave_risk: 0.35 }
    ],

    assessments: [] // Will be populated dynamically
}

// Helper to check if we're in demo mode
export const isDemoMode = () => {
    return process.env.DEMO_MODE === 'true' ||
        !process.env.SUPABASE_URL ||
        process.env.SUPABASE_URL === 'https://demo.supabase.co'
}

export default supabase
