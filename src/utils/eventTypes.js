import {
    HelpCircle,
    Image,
    Timer,
    Zap,
    AlertTriangle,
    Swords,
    Layers,
    Brain,
} from 'lucide-react';

// Event type constants
export const EVENT_TYPES = {
    QA_ROUND: 'QA_ROUND',
    IDENTIFY: 'IDENTIFY',
    BUZZER: 'BUZZER',
    LIGHTNING: 'LIGHTNING',
    WIPEOUT: 'WIPEOUT',
    RAPID_FIRE: 'RAPID_FIRE',
    CARD_FLIP: 'CARD_FLIP',
    MASTER_ROUND: 'MASTER_ROUND',
};

export const CARD_COVERS = [
    { id: 'pattern-1', label: 'Polka Dots', gradient: 'radial-gradient(var(--bg-card) 15%, transparent 16%) 0 0, radial-gradient(var(--bg-card) 15%, transparent 16%) 8px 8px', bgSize: '16px 16px', bgColor: 'var(--accent)' },
    { id: 'pattern-2', label: 'Checkerboard', gradient: 'conic-gradient(#555 90deg, #222 90deg 180deg, #555 180deg 270deg, #222 270deg)', bgSize: '40px 40px', bgColor: '#222' },
    { id: 'pattern-3', label: 'Stripes (Diagonal)', gradient: 'repeating-linear-gradient(45deg, var(--bg-card), var(--bg-card) 10px, var(--bg-tertiary) 10px, var(--bg-tertiary) 20px)', bgSize: 'auto', bgColor: 'var(--bg-tertiary)' },
    { id: 'pattern-4', label: 'Zig Zag', gradient: 'linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%) -50px 0, linear-gradient(225deg, rgba(255,255,255,0.1) 25%, transparent 25%) -50px 0, linear-gradient(315deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%)', bgSize: '100px 100px', bgColor: '#e74c3c' },
    { id: 'pattern-5', label: 'Grid Lines', gradient: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', bgSize: '20px 20px', bgColor: 'var(--bg-secondary)' },
    { id: 'pattern-6', label: 'Honeycomb', gradient: 'radial-gradient(circle, transparent 20%, var(--bg-card) 20%, var(--bg-card) 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, var(--bg-card) 20%, var(--bg-card) 80%, transparent 80%, transparent) 25px 25px, linear-gradient(#2ecc71 8px, transparent 8px) 0 -4px, linear-gradient(90deg, #2ecc71 8px, transparent 8px) -4px 0', bgSize: '50px 50px', bgColor: '#2ecc71' },
    { id: 'pattern-7', label: 'Waves', gradient: 'radial-gradient(circle at 100% 50%, transparent 20%, rgba(255,255,255,.3) 21%, rgba(255,255,255,.3) 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, rgba(255,255,255,.3) 21%, rgba(255,255,255,.3) 34%, transparent 35%, transparent) 0 -50px', bgSize: '100px 100px', bgColor: '#3498db' },
    { id: 'pattern-8', label: 'Diamonds', gradient: 'linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111), linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111)', bgSize: '20px 20px', bgColor: '#444' },
    { id: 'pattern-9', label: 'Carbon Fiber', gradient: 'radial-gradient(black 15%, transparent 16%) 0 0, radial-gradient(black 15%, transparent 16%) 8px 8px, radial-gradient(rgba(255,255,255,.1) 15%, transparent 20%) 0 1px, radial-gradient(rgba(255,255,255,.1) 15%, transparent 20%) 8px 9px', bgSize: '16px 16px', bgColor: '#282828' },
    { id: 'pattern-10', label: 'Stars', gradient: 'radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px), radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 40px)', bgSize: '550px 550px, 350px 350px, 250px 250px', bgColor: 'black' },
];


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
        description: 'Head-to-head team duel',
        icon: Swords,
        color: '#1ABC9C',
    },
    CARD_FLIP: {
        type: 'CARD_FLIP',
        label: 'Card Flip Round',
        description: 'Pick a card — topic info or a challenge question',
        icon: Layers,
        color: '#8E44AD',
    },
    MASTER_ROUND: {
        type: 'MASTER_ROUND',
        label: 'Master Questions',
        description: 'Use fewer hints, earn more points',
        icon: Brain,
        color: '#16A085',
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
            timerStyle: 'circular',
            warningThreshold: 5,
            autoRevealOnTimeout: true,
            penaltyOnPass: false,
            questionTransition: 'slide',
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
            teamOrder: 'sequence',
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
            pointsPerWin: 25,
            pointsPerQuestion: 5,
            timeToBuzz: 8,
        },
    },
    CARD_FLIP: {
        config: {
            name: 'Card Flip Round',
            numCards: 6,
            pointsPerCard: 10,
        },
        questions: [],
    },
    MASTER_ROUND: {
        config: {
            name: 'Master Questions',
            points0: 30,  // no hints
            points1: 20,  // 1 hint
            points2: 10,  // 2 hints
            points3: 5,   // all 3 hints
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
                points: null,
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
        case EVENT_TYPES.CARD_FLIP:
            return {
                topic: '',
                instructions: '',
                isChallenge: false,
                icon: '🃏',
                coverImage: 'pattern-1',
                negativeMarks: false,
                negativePoints: 5,
                subQuestions: [], // holds embedded questions for this card
            };
        case EVENT_TYPES.MASTER_ROUND:
            return {
                questionText: '',
                answer: '',
                hint1: '',
                hint2: '',
                hint3: '',
                points0: null, // null = use event default
                points1: null,
                points2: null,
                points3: null,
            };
        default:
            return { questionText: '', options: [], correctOptionIndex: 0 };
    }
}

// Option labels
export const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
