export interface Counselor {
  id: string;
  name: string;
  profession: string;
  specialty: string[];
  website: string;
  languages: string[];
  available: boolean;
}

export const counselors: Counselor[] = [
  {
    id: "1",
    name: "Aekta Brahmbhatt",
    profession: "Senior Counsellor / Therapist",
    specialty: ["Relationships", "Career", "Life Stress"],
    website: "https://indiatherapist.com/select-your-therapist/#aekta-brahmbhatt",
    languages: ["English", "Hindi"],
    available: true,
  },
  {
    id: "2",
    name: "Sharmee M Divan",
    profession: "Therapist",
    specialty: ["Anxiety", "Self-Awareness", "Stress"],
    website: "https://indiatherapist.com/select-your-therapist/#sharmee-m-divan",
    languages: ["English", "Hindi", "Gujarati"],
    available: true,
  },
  {
    id: "3",
    name: "Shilpashree Medhi",
    profession: "Counselling Psychologist",
    specialty: ["Anxiety", "Depression", "Relationship Counselling"],
    website: "https://click2pro.com/psychologists/",
    languages: ["English", "Hindi"],
    available: true,
  },
  {
    id: "4",
    name: "Rudrakshi Razdan",
    profession: "Clinical & Counselling Psychologist",
    specialty: ["Anxiety", "Depression"],
    website: "https://click2pro.com/psychologists/",
    languages: ["English", "Hindi"],
    available: false,
  },
  {
    id: "5",
    name: "Sanjeevini Dixit",
    profession: "Clinical Psychologist",
    specialty: ["Stress Management", "Relationship Support", "Self-Esteem"],
    website: "https://click2pro.com/psychologists/",
    languages: ["English", "Hindi", "Kannada"],
    available: true,
  },
  {
    id: "6",
    name: "Naincy Priya",
    profession: "Verified Psychologist",
    specialty: ["Grief Counselling", "Trauma Recovery"],
    website: "https://click2pro.com/psychologists/",
    languages: ["English", "Hindi"],
    available: true,
  },
  {
    id: "7",
    name: "Ms. Pragya Shah",
    profession: "Child & Clinical Psychologist",
    specialty: ["Depression", "Anxiety", "Developmental Stress"],
    website: "https://psychicare.com/book-counselling-2/",
    languages: ["English", "Hindi"],
    available: true,
  },
  {
    id: "8",
    name: "Dr Meera Iyer",
    profession: "Top Clinical Psychologist",
    specialty: ["Anxiety", "Depression", "Stress"],
    website: "https://psychicare.com/book-counselling-2/",
    languages: ["English", "Hindi", "Tamil"],
    available: true,
  },
  {
    id: "9",
    name: "Tharuj Amien",
    profession: "Counseling Psychologist",
    specialty: ["Trauma", "Anxiety", "Depression", "Stress", "Relationship Issues"],
    website: "https://www.neveralone.in/therapists.html",
    languages: ["English", "Hindi"],
    available: false,
  },
  {
    id: "10",
    name: "Zaina Khan",
    profession: "Clinical Psychologist",
    specialty: ["Trauma & Grief", "Anxiety", "Depression", "Stress"],
    website: "https://www.neveralone.in/therapists.html",
    languages: ["English", "Hindi", "Urdu"],
    available: true,
  },
  {
    id: "11",
    name: "Sakshi Malagi",
    profession: "Clinical Psychologist",
    specialty: ["Anxiety", "Depression", "Self-Esteem"],
    website: "https://www.neveralone.in/therapists.html",
    languages: ["English", "Hindi", "Marathi"],
    available: true,
  },
];
