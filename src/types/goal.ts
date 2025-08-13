export interface Task {
    id: string;
    title: string;
    duration: number; // minutes
    link?: string;
    status: 'not_started' | 'in_progress' | 'done';
    pushDone: boolean;
    teacherFeedback?: string;
    score?: number;
}

export interface Goal {
    id: string;
    title: string;
    icon: string;
    startDate: string;
    endDate: string;
    totalHours: number;
    totalTasks: number;
    status: 'not_started' | 'in_progress' | 'done';
    progress: number; // percentage
    completedTasks: number;
    tasks: Task[];
    githubPushes: GitHubPush[];
    teacherFeedback?: string;
    overallScore?: number;
}

export interface GitHubPush {
    id: string;
    date: string;
    message: string;
    url: string;
    progressAdded: number; // minutes
}

// Mock data
export const goalsData: Goal[] = [
    {
        id: '1',
        title: 'Login экранын жасау',
        icon: '💻',
        startDate: '04.08',
        endDate: '06.08',
        totalHours: 5,
        totalTasks: 3,
        status: 'in_progress',
        progress: 67,
        completedTasks: 2,
        tasks: [
            {
                id: '1-1',
                title: 'UI дизайнын жасау',
                duration: 60,
                link: 'Figma Link',
                status: 'in_progress',
                pushDone: true,
                teacherFeedback: 'UI structure жақсы, бірақ padding аз.',
                score: 9
            },
            {
                id: '1-2',
                title: 'Backend API интеграциясы',
                duration: 120,
                link: 'Google Doc',
                status: 'not_started',
                pushDone: false,
                teacherFeedback: 'Күтілуде...',
                score: undefined
            }
        ],
        githubPushes: [
            {
                id: 'push-1',
                date: '2025-08-06',
                message: 'feat: added login UI',
                url: '#',
                progressAdded: 25
            },
            {
                id: 'push-2',
                date: '2025-08-05',
                message: 'refactor: improve UI padding',
                url: '#',
                progressAdded: 25
            }
        ],
        teacherFeedback: 'Код structure дұрыс, бірақ animation жоқ',
        overallScore: 10
    },
    {
        id: '2',
        title: 'Read "Clean Code"',
        icon: '📚',
        startDate: '07.08',
        endDate: '01.09',
        totalHours: 15,
        totalTasks: 10,
        status: 'not_started',
        progress: 0,
        completedTasks: 0,
        tasks: [],
        githubPushes: [],
        teacherFeedback: undefined,
        overallScore: undefined
    },
    {
        id: '3',
        title: 'Complete JavaScript Project',
        icon: '✅',
        startDate: '01.07',
        endDate: '20.07',
        totalHours: 20,
        totalTasks: 5,
        status: 'done',
        progress: 100,
        completedTasks: 5,
        tasks: [],
        githubPushes: [],
        teacherFeedback: 'Жақсы жұмыс!',
        overallScore: 10
    },
    {
        id: '4',
        title: 'Learn SQL Basics',
        icon: '🗄️',
        startDate: '10.08',
        endDate: '25.08',
        totalHours: 10,
        totalTasks: 5,
        status: 'in_progress',
        progress: 40,
        completedTasks: 2,
        tasks: [],
        githubPushes: [],
        teacherFeedback: undefined,
        overallScore: undefined
    },
    {
        id: '5',
        title: 'Understand Git & GitHub',
        icon: '🌿',
        startDate: '01.06',
        endDate: '15.06',
        totalHours: 8,
        totalTasks: 3,
        status: 'done',
        progress: 100,
        completedTasks: 3,
        tasks: [],
        githubPushes: [],
        teacherFeedback: 'Git командаларын жақсы меңгерген',
        overallScore: 9
    }
];
