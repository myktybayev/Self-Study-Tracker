export interface Task {
    id: string;
    title: string;
    description?: string;
    estimatedMinutes: number;
    actualMinutes?: number;
    status: 'not_started' | 'in_progress' | 'completed';
    resourceUrl?: string;
    githubPushed: boolean;
    feedback?: {
        text: string;
        score: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface GitHubPush {
    id: string;
    commitMessage: string;
    repositoryName: string;
    commitUrl: string;
    timestamp: Date;
    progressAdded: number; // minutes added to progress
}

export interface Goal {
    id: string;
    userId: string;
    title: string;
    description: string;
    category: 'WEB' | 'MOBILE' | 'UI/UX' | 'GRAPHIC' | '3D';
    status: 'active' | 'completed' | 'paused';
    estimatedHours: number;
    actualHours: number;
    targetDate: Date;
    priority: 'low' | 'medium' | 'high';
    progress: number;
    tasks: Task[];
    githubPushes: GitHubPush[];
    createdAt: Date;
    updatedAt: Date;
}

// Mock data for development
export const goalsData: Goal[] = [
    {
        id: '1',
        userId: 'github_123456',
        title: 'React Todo App',
        description: 'Build a complete todo application with React and Firebase',
        category: 'WEB',
        status: 'active',
        estimatedHours: 8,
        actualHours: 2,
        targetDate: new Date('2024-12-31'),
        priority: 'high',
        progress: 25,
        tasks: [
            {
                id: 'task_1',
                title: 'UI дизайнын жасау',
                description: 'Create the main UI components for the todo app',
                estimatedMinutes: 60,
                status: 'in_progress',
                resourceUrl: 'https://youtube.com/watch?v=example',
                githubPushed: true,
                feedback: {
                    text: 'UI structure жақсы, бірақ padding аз.',
                    score: 9
                },
                actualMinutes: 25,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-02')
            },
            {
                id: 'task_2',
                title: 'Firebase интеграциясы',
                description: 'Connect the app to Firebase for data persistence',
                estimatedMinutes: 90,
                status: 'not_started',
                resourceUrl: 'https://firebase.google.com/docs',
                githubPushed: false,
                actualMinutes: 0,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01')
            }
        ],
        githubPushes: [
            {
                id: 'push_1',
                commitMessage: 'feat: added login UI',
                repositoryName: 'react-todo-app',
                commitUrl: 'https://github.com/user/react-todo-app/commit/abc123',
                timestamp: new Date('2024-01-02'),
                progressAdded: 25
            }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02')
    }
];
