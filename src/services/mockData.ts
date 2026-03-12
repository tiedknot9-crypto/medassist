
export const MOCK_DEPARTMENTS = ["Cardiology", "Orthopedic", "ENT", "General Medicine", "Neurology", "Pediatrics", "Dermatology"];

export const MOCK_DOCTORS = [
  { id: 1, name: "Dr. Sameer Sharma", specialization: "Senior Cardiologist", department: "Cardiology", availability: "Mon-Fri, 10:00 AM - 4:00 PM" },
  { id: 2, name: "Dr. Ananya Iyer", specialization: "Orthopedic Surgeon", department: "Orthopedic", availability: "Tue-Sat, 11:00 AM - 5:00 PM" },
  { id: 3, name: "Dr. Rahul Verma", specialization: "ENT Specialist", department: "ENT", availability: "Mon-Thu, 9:00 AM - 1:00 PM" },
  { id: 4, name: "Dr. Priya Singh", specialization: "General Physician", department: "General Medicine", availability: "Daily, 8:00 AM - 8:00 PM" },
  { id: 5, name: "Dr. Vikram Malhotra", specialization: "Neurologist", department: "Neurology", availability: "Mon, Wed, Fri, 2:00 PM - 6:00 PM" },
  { id: 6, name: "Dr. Sneha Kapoor", specialization: "Pediatrician", department: "Pediatrics", availability: "Daily, 10:00 AM - 2:00 PM" },
  { id: 7, name: "Dr. Amit Trivedi", specialization: "Dermatologist", department: "Dermatology", availability: "Tue, Thu, Sat, 4:00 PM - 8:00 PM" }
];

export const MOCK_PATIENTS = [
  { id: "P10234", name: "Rahul Sharma", mobile: "9876543210", age: 35, gender: "Male" },
  { id: "P10235", name: "Anjali Verma", mobile: "9988776655", age: 28, gender: "Female" }
];

export const MOCK_REPORTS = [
  { id: "R999", patient_id: "P10234", test_name: "Blood Sugar", status: "Ready", result_url: "https://example.com/report.pdf" },
  { id: "R1000", patient_id: "P10235", test_name: "Thyroid Profile", status: "Pending", result_url: "" }
];

export const MOCK_SERVICES = [
  { id: 1, name: "General Consultation", description: "Standard checkup with a general physician.", price: 500 },
  { id: 2, name: "Cardiology Screening", description: "Comprehensive heart health assessment including ECG.", price: 2500 },
  { id: 3, name: "X-Ray (Chest)", description: "High-resolution digital X-ray imaging.", price: 800 },
  { id: 4, name: "Blood Test (Full Profile)", description: "Complete blood count and metabolic panel.", price: 1500 },
  { id: 5, name: "MRI Scan", description: "Advanced magnetic resonance imaging for detailed diagnosis.", price: 6000 },
  { id: 6, name: "Physiotherapy Session", description: "Expert physical therapy for recovery and pain management.", price: 1200 },
  { id: 7, name: "Dental Cleaning", description: "Professional scaling and polishing for oral hygiene.", price: 1000 }
];
