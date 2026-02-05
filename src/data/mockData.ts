// Mock data for the dashboard
export const mockCoach = {
  name: "Dr. Felipe Silva",
  crn: "CREF 012345-G/SP",
  email: "contato@apexpro.pro",
  avatar: "FS",
  specialty: "Alta Performance & Treinamento de Força",
  clients: 58,
};

export const mockClients = [
  {
    id: "1",
    name: "João Silva",
    avatar: "JS",
    email: "joao@email.com",
    phone: "(11) 99999-1111",
    objective: "Hipertrofia",
    currentWeight: 85.5,
    targetWeight: 90,
    startWeight: 82,
    adherence: 87,
    lastConsult: "2026-01-25",
    nextConsult: "2026-01-28",
    status: "active",
    daysActive: 45,
    planName: "Protocolo Bulking A1",
    birthDate: "1990-05-15",
    allergies: ["Lactose"],
    restrictions: ["Joelho (Lesão LCA)"],
    notes: "Atleta focado, progressão de carga constante no supino.",
  },
  {
    id: "2",
    name: "Maria Oliveira",
    avatar: "MO",
    email: "maria@email.com",
    phone: "(11) 99999-2222",
    objective: "Definição",
    currentWeight: 58,
    targetWeight: 55,
    startWeight: 62,
    adherence: 92,
    lastConsult: "2026-01-24",
    nextConsult: "2026-01-30",
    status: "active",
    daysActive: 60,
    planName: "Protocolo Cutting B2",
    birthDate: "1995-08-22",
    allergies: [],
    restrictions: [],
    notes: "Excelente técnica de execução.",
  },
  {
    id: "3",
    name: "Pedro Costa",
    avatar: "PC",
    email: "pedro@email.com",
    phone: "(11) 99999-3333",
    objective: "Condicionamento",
    currentWeight: 72,
    targetWeight: 72,
    startWeight: 78,
    adherence: 65,
    lastConsult: "2026-01-20",
    nextConsult: "2026-02-05",
    status: "active",
    daysActive: 90,
    planName: "Metabolismo Ativo",
    birthDate: "1988-03-10",
    allergies: [],
    restrictions: [],
    notes: "Dificuldade em manter volume de treino.",
  },
];

export const mockTodayAppointments = [
  {
    id: "1",
    clientId: "1",
    clientName: "João Silva",
    clientAvatar: "JS",
    time: "09:00",
    type: "Retorno",
    status: "confirmed",
  },
  {
    id: "2",
    clientId: "4",
    clientName: "Ana Beatriz",
    clientAvatar: "AB",
    time: "10:30",
    type: "Avaliação",
    status: "confirmed",
  },
  {
    id: "3",
    clientId: "2",
    clientName: "Maria Oliveira",
    clientAvatar: "MO",
    time: "14:00",
    type: "Retorno",
    status: "pending",
  },
  {
    id: "4",
    clientId: "5",
    clientName: "Carlos Mendes",
    clientAvatar: "CM",
    time: "16:00",
    type: "Nova Consulta",
    status: "confirmed",
  },
];

export const mockAlerts = [
  {
    id: "1",
    type: "warning",
    title: "Alunos FORA DE RITMO",
    description: "3 alunos não registraram treinos há mais de 5 dias",
    clients: ["Pedro Costa", "Fernanda Lima", "Carlos Mendes"],
  },
  {
    id: "2",
    type: "info",
    title: "Ciclos de Treino a Vencer",
    description: "2 protocolos de treinamento expiram nos próximos 7 dias",
    clients: ["João Silva", "Maria Oliveira"],
  },
  {
    id: "3",
    type: "message",
    title: "Relatórios de Execução",
    description: "4 feedbacks de treino aguardando resposta",
    count: 4,
  },
];

export const mockMessages = [
  {
    id: "1",
    clientId: "1",
    clientName: "João Silva",
    clientAvatar: "JS",
    message: "Dra., posso substituir o frango por peixe hoje?",
    time: "08:45",
    unread: true,
  },
  {
    id: "2",
    clientId: "4",
    clientName: "Ana Beatriz",
    clientAvatar: "AB",
    message: "Bom dia! Confirmando a consulta de hoje às 10:30",
    time: "07:30",
    unread: true,
  },
  {
    id: "3",
    clientId: "2",
    clientName: "Maria Oliveira",
    clientAvatar: "MO",
    message: "Consegui bater a meta de proteína ontem! 💪",
    time: "Ontem",
    unread: false,
  },
];

export const mockEvolutionData = [
  { month: "Ago", avgWeight: 78.5, clients: 42 },
  { month: "Set", avgWeight: 77.2, clients: 45 },
  { month: "Out", avgWeight: 76.8, clients: 48 },
  { month: "Nov", avgWeight: 75.5, clients: 52 },
  { month: "Dez", avgWeight: 74.2, clients: 55 },
  { month: "Jan", avgWeight: 73.8, clients: 58 },
];

export const mockMealPlan = {
  id: "1",
  name: "Emagrecimento 1800kcal",
  totalCalories: 1800,
  protein: 120,
  carbs: 180,
  fat: 60,
  meals: [
    {
      id: "1",
      name: "Café da Manhã",
      time: "07:00",
      foods: [
        { name: "Ovos mexidos", quantity: "2 unidades", calories: 180, protein: 12, carbs: 2, fat: 14 },
        { name: "Pão integral", quantity: "2 fatias", calories: 140, protein: 6, carbs: 24, fat: 2 },
        { name: "Abacate", quantity: "50g", calories: 80, protein: 1, carbs: 4, fat: 7 },
      ],
    },
    {
      id: "2",
      name: "Lanche da Manhã",
      time: "10:00",
      foods: [
        { name: "Iogurte natural", quantity: "170g", calories: 100, protein: 10, carbs: 8, fat: 3 },
        { name: "Granola", quantity: "30g", calories: 120, protein: 3, carbs: 20, fat: 3 },
      ],
    },
    {
      id: "3",
      name: "Almoço",
      time: "12:30",
      foods: [
        { name: "Frango grelhado", quantity: "150g", calories: 240, protein: 35, carbs: 0, fat: 10 },
        { name: "Arroz integral", quantity: "100g", calories: 130, protein: 3, carbs: 28, fat: 1 },
        { name: "Feijão", quantity: "80g", calories: 70, protein: 5, carbs: 12, fat: 0 },
        { name: "Salada verde", quantity: "à vontade", calories: 30, protein: 2, carbs: 5, fat: 0 },
      ],
    },
    {
      id: "4",
      name: "Lanche da Tarde",
      time: "16:00",
      foods: [
        { name: "Banana", quantity: "1 média", calories: 90, protein: 1, carbs: 23, fat: 0 },
        { name: "Pasta de amendoim", quantity: "20g", calories: 120, protein: 5, carbs: 4, fat: 10 },
      ],
    },
    {
      id: "5",
      name: "Jantar",
      time: "19:30",
      foods: [
        { name: "Salmão", quantity: "120g", calories: 250, protein: 25, carbs: 0, fat: 16 },
        { name: "Batata doce", quantity: "150g", calories: 130, protein: 2, carbs: 30, fat: 0 },
        { name: "Legumes assados", quantity: "150g", calories: 80, protein: 3, carbs: 15, fat: 2 },
      ],
    },
  ],
};

export const mockTrainingPlan = {
  id: "1",
  name: "Treino ABC - Hipertrofia",
  frequency: "3x por semana",
  workouts: [
    {
      id: "A",
      name: "Treino A - Peito e Tríceps",
      exercises: [
        { name: "Supino reto", sets: 4, reps: "10-12", rest: "90s", weight: "40kg" },
        { name: "Supino inclinado", sets: 3, reps: "10-12", rest: "90s", weight: "30kg" },
        { name: "Crucifixo", sets: 3, reps: "12-15", rest: "60s", weight: "12kg" },
        { name: "Tríceps pulley", sets: 3, reps: "12-15", rest: "60s", weight: "25kg" },
        { name: "Tríceps francês", sets: 3, reps: "10-12", rest: "60s", weight: "15kg" },
      ],
    },
    {
      id: "B",
      name: "Treino B - Costas e Bíceps",
      exercises: [
        { name: "Puxada frontal", sets: 4, reps: "10-12", rest: "90s", weight: "50kg" },
        { name: "Remada curvada", sets: 4, reps: "10-12", rest: "90s", weight: "35kg" },
        { name: "Remada baixa", sets: 3, reps: "12-15", rest: "60s", weight: "40kg" },
        { name: "Rosca direta", sets: 3, reps: "10-12", rest: "60s", weight: "15kg" },
        { name: "Rosca martelo", sets: 3, reps: "12-15", rest: "60s", weight: "12kg" },
      ],
    },
    {
      id: "C",
      name: "Treino C - Pernas",
      exercises: [
        { name: "Agachamento", sets: 4, reps: "10-12", rest: "120s", weight: "60kg" },
        { name: "Leg press", sets: 4, reps: "12-15", rest: "90s", weight: "120kg" },
        { name: "Cadeira extensora", sets: 3, reps: "12-15", rest: "60s", weight: "35kg" },
        { name: "Mesa flexora", sets: 3, reps: "12-15", rest: "60s", weight: "30kg" },
        { name: "Panturrilha", sets: 4, reps: "15-20", rest: "45s", weight: "50kg" },
      ],
    },
  ],
};

export type Client = typeof mockClients[0];
export type Appointment = typeof mockTodayAppointments[0];
export type Alert = typeof mockAlerts[0];
export type Message = typeof mockMessages[0];
