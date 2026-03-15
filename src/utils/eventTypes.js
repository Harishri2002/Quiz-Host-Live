import {
    HelpCircle,
    Image,
    Timer,
    Zap,
    AlertTriangle,
    Swords,
} from 'lucide-react';

// Event type constants
export const EVENT_TYPES = {
    QA_ROUND: 'QA_ROUND',
    IDENTIFY: 'IDENTIFY',
    BUZZER: 'BUZZER',
    LIGHTNING: 'LIGHTNING',
    WIPEOUT: 'WIPEOUT',
    RAPID_FIRE: 'RAPID_FIRE',
};

// Event type metadata (for the library/UI)
export const EVENT_META = {
    QA_ROUND: {
        type: 'QA_ROUND',
        label: 'Q&A Round',
        description: 'Classic multiple-choice quiz round',
        icon: HelpCircle,
        color: '#3498DB',
    },
    IDENTIFY: {
        type: 'IDENTIFY',
        label: 'Identify Round',
        description: 'Identify images or sounds',
        icon: Image,
        color: '#9B59B6',
    },
    BUZZER: {
        type: 'BUZZER',
        label: 'Buzzer Round',
        description: 'Timed questions with countdown',
        icon: Timer,
        color: '#E74C3C',
    },
    LIGHTNING: {
        type: 'LIGHTNING',
        label: 'Lightning Round',
        description: 'Rapid Q&A — max answers in limited time',
        icon: Zap,
        color: '#F39C12',
    },
    WIPEOUT: {
        type: 'WIPEOUT',
        label: 'Wipeout Round',
        description: 'Risk & reward — wager on your confidence',
        icon: AlertTriangle,
        color: '#E67E22',
    },
    RAPID_FIRE: {
        type: 'RAPID_FIRE',
        label: 'Rapid Fire Duel',
        description: 'Head-to-head team duels',
        icon: Swords,
        color: '#1ABC9C',
    },
};

// Default configurations for each event type
export const EVENT_DEFAULTS = {
    QA_ROUND: {
        config: {
            name: 'Q&A Round',
            numQuestions: 10,
            optionsPerQuestion: 4,
            pointsPerCorrect: 10,
            negativeMarking: false,
            negativePoints: 5,
            showQuestionNumber: true,
            allowSkip: false,
            questionTimer: false,
            timerDuration: 30,
        },
    },
    IDENTIFY: {
        config: {
            name: 'Identify Round',
            subMode: 'mixed', // image | sound | mixed
            numItems: 8,
            pointsPerCorrect: 15,
            showOptions: true,
            optionsPerItem: 4,
            blurReveal: true,
            blurStages: 3,
            audioAutoPlay: true,
            allowReplay: true,
        },
    },
    BUZZER: {
        config: {
            name: 'Buzzer Round',
            numQuestions: 10,
            timePerQuestion: 20,
            pointsPerCorrect: 20,
            showOptions: false,
            timerStyle: 'circular', // circular | linear | digital | flipping
            warningThreshold: 5,
            autoRevealOnTimeout: true,
            penaltyOnPass: false,
            questionTransition: 'slide', // slide | fade | flip | zoom
        },
    },
    LIGHTNING: {
        config: {
            name: 'Lightning Round',
            timePerTeam: 60,
            questionPool: 50,
            pointsPerCorrect: 5,
            negativeMarking: false,
            passAllowed: true,
            teamOrder: 'sequence', // sequence | random | mc_choice
        },
    },
    WIPEOUT: {
        config: {
            name: 'Wipeout Round',
            numQuestions: 5,
            basePoints: 20,
            riskLevels: [1, 2, 3],
            minimumWager: 1,
            allowZeroWager: false,
            simultaneousWager: true,
            showTeamWagers: true,
        },
    },
    RAPID_FIRE: {
        config: {
            name: 'Rapid Fire Duel',
            questionsPerDuel: 5,
            duelFormat: 'round-robin', // round-robin | bracket | mc_choice
            pointsPerWin: 25,
            pointsPerQuestion: 5,
            timeToBuzz: 8,
        },
    },
};

// Generate a blank question for a given event type
export function createBlankQuestion(eventType) {
    switch (eventType) {
        case EVENT_TYPES.QA_ROUND:
        case EVENT_TYPES.BUZZER:
        case EVENT_TYPES.LIGHTNING:
        case EVENT_TYPES.WIPEOUT:
        case EVENT_TYPES.RAPID_FIRE:
            return {
                questionText: '',
                options: ['', '', '', ''],
                correctOptionIndex: 0,
                points: null, // null = use event default
                mediaType: 'none',
                mediaFile: null,
                hint: '',
                explanation: '',
            };
        case EVENT_TYPES.IDENTIFY:
            return {
                itemType: 'image',
                mediaFile: null,
                question: '',
                answer: '',
                options: ['', '', '', ''],
                correctOptionIndex: 0,
                points: null,
            };
        default:
            return { questionText: '', options: [], correctOptionIndex: 0 };
    }
}

// Option labels
export const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
