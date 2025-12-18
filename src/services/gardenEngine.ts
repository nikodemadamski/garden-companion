import { Plant, JournalEntry } from '../types/plant';

export const XP_PER_LEVEL = 100;

export interface MilestoneResult {
    newLevel: number;
    didLevelUp: boolean;
    milestoneEntry?: JournalEntry;
}

export const GardenEngine = {
    calculateLevelProgress: (xp: number, level: number) => {
        const nextLevelXP = level * XP_PER_LEVEL;
        return Math.min((xp / nextLevelXP) * 100, 100);
    },

    processXPGain: (plant: Plant, amount: number): MilestoneResult => {
        const newXP = plant.xp + amount;
        const nextLevelXP = plant.level * XP_PER_LEVEL;

        if (newXP >= nextLevelXP) {
            const newLevel = plant.level + 1;
            return {
                newLevel,
                didLevelUp: true,
                milestoneEntry: {
                    id: Math.random().toString(36).substring(2, 11),
                    date: new Date().toISOString(),
                    note: `🎉 Reached Level ${newLevel}! ${newLevel >= 5 ? '👑' : '✨'}`,
                    type: 'milestone'
                }
            };
        }

        return {
            newLevel: plant.level,
            didLevelUp: false
        };
    },

    getGardenRank: (harmonyScore: number) => {
        if (harmonyScore >= 95) return { title: 'Forest Guardian', icon: '🌳', color: '#2D3748' };
        if (harmonyScore >= 80) return { title: 'Master Gardener', icon: '🌿', color: '#38A169' };
        if (harmonyScore >= 60) return { title: 'Green Thumb', icon: '🌱', color: '#48BB78' };
        if (harmonyScore >= 40) return { title: 'Seedling', icon: '🪴', color: '#68D391' };
        return { title: 'New Sprout', icon: '🌱', color: '#A0AEC0' };
    },

    getLeaderboardMock: () => [
        { name: 'Aoife from Cork', score: 98, rank: 'Forest Guardian', avatar: '👩‍🌾' },
        { name: 'Liam in Dublin', score: 92, rank: 'Master Gardener', avatar: '👨‍🌾' },
        { name: 'You', score: 85, rank: 'Master Gardener', avatar: '👤', isUser: true },
        { name: 'Siobhan (Galway)', score: 78, rank: 'Green Thumb', avatar: '👩‍🌾' },
        { name: 'Conor (Limerick)', score: 65, rank: 'Green Thumb', avatar: '👨‍🌾' }
    ]
};
