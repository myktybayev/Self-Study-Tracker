import { db } from './firebase';
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where, orderBy, Timestamp, setDoc } from 'firebase/firestore';
import { Goal, Task, GitHubPush } from '@/types/goal';

// Helper function to check if Firebase is available
const isFirebaseAvailable = () => {
    return db !== undefined;
};

// Helper function to get user goals subcollection reference
const getUserGoalsCollection = (userId: string) => {
    if (!isFirebaseAvailable()) {
        throw new Error('Firebase is not available');
    }
    return collection(db!, 'goals', userId, 'userGoals');
};

// Helper function to get user document reference
const getUserDocument = (userId: string) => {
    if (!isFirebaseAvailable()) {
        throw new Error('Firebase is not available');
    }
    return doc(db!, 'goals', userId);
};

// Create a new goal
export const createGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!isFirebaseAvailable()) {
        throw new Error('Firebase is not available');
    }

    const { userId, ...goalWithoutUserId } = goalData;

    // First, ensure user document exists
    const userDocRef = getUserDocument(userId);
    await setDoc(userDocRef, {
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    }, { merge: true });

    const goalWithTimestamps = {
        ...goalWithoutUserId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(getUserGoalsCollection(userId), goalWithTimestamps);
    return docRef.id;
};

// Get all goals for a specific user
export const getUserGoals = async (userId: string): Promise<Goal[]> => {
    if (!isFirebaseAvailable()) {
        console.warn('Firebase not available, returning empty array');
        return [];
    }

    try {
        const q = query(
            getUserGoalsCollection(userId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            userId, // Add userId back to the goal object
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            targetDate: doc.data().targetDate?.toDate() || new Date(),
        })) as Goal[];
    } catch (error) {
        console.error('Error getting user goals:', error);
        return [];
    }
};

// Get a specific goal by ID
export const getGoalById = async (userId: string, goalId: string): Promise<Goal | null> => {
    if (!isFirebaseAvailable()) {
        throw new Error('Firebase is not available');
    }

    try {
        const docRef = doc(db!, 'goals', userId, 'userGoals', goalId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                userId, // Add userId back to the goal object
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                targetDate: data.targetDate?.toDate() || new Date(),
            } as Goal;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting goal:', error);
        return null;
    }
};

// Update a goal
export const updateGoal = async (userId: string, goalId: string, updates: Partial<Goal>): Promise<void> => {
    if (!isFirebaseAvailable()) {
        throw new Error('Firebase is not available');
    }

    const { userId: _, ...updatesWithoutUserId } = updates; // Remove userId from updates
    const docRef = doc(db!, 'goals', userId, 'userGoals', goalId);
    await updateDoc(docRef, {
        ...updatesWithoutUserId,
        updatedAt: Timestamp.now(),
    });
};

// Delete a goal
export const deleteGoal = async (userId: string, goalId: string): Promise<void> => {
    if (!isFirebaseAvailable()) {
        throw new Error('Firebase is not available');
    }

    const docRef = doc(db!, 'goals', userId, 'userGoals', goalId);
    await deleteDoc(docRef);
};

// Add a task to a goal
export const addTaskToGoal = async (userId: string, goalId: string, task: Omit<Task, 'id'>): Promise<void> => {
    if (!isFirebaseAvailable()) {
        throw new Error('Firebase is not available');
    }

    const goal = await getGoalById(userId, goalId);
    if (!goal) {
        throw new Error('Goal not found');
    }

    const newTask: Task = {
        ...task,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedTasks = [...goal.tasks, newTask];
    await updateGoal(userId, goalId, { tasks: updatedTasks });
};

// Update a task in a goal
export const updateTaskInGoal = async (userId: string, goalId: string, taskId: string, updates: Partial<Task>): Promise<void> => {
    if (!isFirebaseAvailable()) {
        throw new Error('Firebase is not available');
    }

    const goal = await getGoalById(userId, goalId);
    if (!goal) {
        throw new Error('Goal not found');
    }

    const updatedTasks = goal.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
    );

    await updateGoal(userId, goalId, { tasks: updatedTasks });
};

// Add a GitHub push to a goal
export const addGitHubPushToGoal = async (userId: string, goalId: string, push: Omit<GitHubPush, 'id'>): Promise<void> => {
    if (!isFirebaseAvailable()) {
        throw new Error('Firebase is not available');
    }

    const goal = await getGoalById(userId, goalId);
    if (!goal) {
        throw new Error('Goal not found');
    }

    const newPush: GitHubPush = {
        ...push,
        id: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedPushes = [...goal.githubPushes, newPush];
    await updateGoal(userId, goalId, { githubPushes: updatedPushes });
};

// Get goals by status for a specific user
export const getGoalsByStatus = async (userId: string, status: 'all' | 'active' | 'completed' | 'paused'): Promise<Goal[]> => {
    if (!isFirebaseAvailable()) {
        console.warn('Firebase not available, returning empty array');
        return [];
    }

    try {
        let q;
        if (status === 'all') {
            q = query(
                getUserGoalsCollection(userId),
                orderBy('createdAt', 'desc')
            );
        } else {
            q = query(
                getUserGoalsCollection(userId),
                where('status', '==', status),
                orderBy('createdAt', 'desc')
            );
        }

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            userId, // Add userId back to the goal object
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            targetDate: doc.data().targetDate?.toDate() || new Date(),
        })) as Goal[];
    } catch (error) {
        console.error('Error getting goals by status:', error);
        return [];
    }
};
