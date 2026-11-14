import { STAGES } from './constants.js';

export const initialSessionState = {
  stage: STAGES.INPUT,
  topic: '',
  level: 'beginner',
  lesson: null,
  quiz: null,
  answers: {}, // questionId -> optionIndex
  currentQuestionIndex: 0,
  report: null,
  remediation: null,
  activeReviewTab: 'reexplained', // 'reexplained' | 'remember' | 'revise'
};

export function sessionReducer(state, action) {
  switch (action.type) {
    case 'SET_TOPIC_AND_LEVEL':
      return {
        ...state,
        topic: action.payload.topic,
        level: action.payload.level,
      };

    case 'SET_LESSON':
      return {
        ...state,
        lesson: action.payload,
        stage: STAGES.LESSON,
      };

    case 'SET_QUIZ':
      return {
        ...state,
        quiz: action.payload,
        answers: {},
        currentQuestionIndex: 0,
        stage: STAGES.QUIZ,
      };

    case 'ANSWER_QUESTION':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: action.payload.optionIndex,
        },
      };

    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };

    case 'PREV_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
      };

    case 'SET_REPORT':
      return {
        ...state,
        report: action.payload,
        stage: STAGES.REPORT,
      };

    case 'SET_REMEDIATION':
      return {
        ...state,
        remediation: action.payload,
        stage: STAGES.REVIEW,
      };

    case 'SET_STAGE':
      return {
        ...state,
        stage: action.payload,
      };

    case 'SET_REVIEW_TAB':
      return {
        ...state,
        activeReviewTab: action.payload,
      };

    case 'RESET_SESSION':
      return {
        ...initialSessionState,
      };

    default:
      return state;
  }
}

