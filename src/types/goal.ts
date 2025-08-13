export interface Task {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    estimatedMinutes: number;
    actualMinutes?: number;
    createdAt: Date;
    completedAt?: Date;
}

export interface GitHubPush {
    id: string;
    commitMessage: string;
    repository: string;
    branch: string;
    timestamp: Date;
    minutesEarned: number;
}

export interface Goal {
    id: string;
    userId: string; // Firebase user ID
    title: string;
    description: string;
    category: 'WEB' | 'MOBILE' | 'UI/UX' | 'GRAPHIC' | '3D';
    status: 'active' | 'completed' | 'paused';
    priority: 'low' | 'medium' | 'high';
    targetDate: Date;
    estimatedHours: number;
    actualHours: number;
    progress: number; // 0-100
    tasks: Task[];
    githubPushes: GitHubPush[];
    createdAt: Date;
    updatedAt: Date;
}

// Mock data for development
export const goalsData: Goal[] = [
    {
        id: '1',
        userId: 'user1',
        title: 'Login экран жасау',
        description: 'React Native арқылы әдемі login экран жасау',
        category: 'MOBILE',
        status: 'active',
        priority: 'high',
        targetDate: new Date('2024-02-15'),
        estimatedHours: 8,
        actualHours: 4,
        progress: 50,
        tasks: [
            {
                id: '1',
                title: 'UI дизайн жасау',
                description: 'Figma-да login экран дизайнын жасау',
                completed: true,
                estimatedMinutes: 120,
                actualMinutes: 90,
                createdAt: new Date('2024-01-20'),
                completedAt: new Date('2024-01-21'),
            },
            {
                id: '2',
                title: 'React Native компонент жасау',
                description: 'Login формасын React Native-де жасау',
                completed: false,
                estimatedMinutes: 180,
                createdAt: new Date('2024-01-22'),
            },
        ],
        githubPushes: [
            {
                id: '1',
                commitMessage: 'Add login screen UI components',
                repository: 'my-app',
                branch: 'main',
                timestamp: new Date('2024-01-21T10:30:00'),
                minutesEarned: 25,
            },
        ],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-21'),
    },
    {
        id: '2',
        userId: 'user1',
        title: 'Dashboard API интеграция',
        description: 'Backend API-мен dashboard деректерін интеграция жасау',
        category: 'WEB',
        status: 'active',
        priority: 'medium',
        targetDate: new Date('2024-02-20'),
        estimatedHours: 12,
        actualHours: 6,
        progress: 30,
        tasks: [
            {
                id: '3',
                title: 'API endpoint жасау',
                description: 'Dashboard деректерін қайтаратын API жасау',
                completed: true,
                estimatedMinutes: 240,
                actualMinutes: 200,
                createdAt: new Date('2024-01-18'),
                completedAt: new Date('2024-01-19'),
            },
        ],
        githubPushes: [
            {
                id: '2',
                commitMessage: 'Implement dashboard API endpoints',
                repository: 'backend-api',
                branch: 'develop',
                timestamp: new Date('2024-01-19T14:20:00'),
                minutesEarned: 25,
            },
        ],
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-19'),
    },
];
