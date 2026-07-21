// Odoo 模块: website_event_track_quiz
// 由 odoo-parser.py + odoo2feida.js 自动生成
exports.models = [
  {
    "_name": "event.quiz",
    "_description": "Quiz",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Name",
        "required": true
      },
      "question_ids": {
        "type": "one2many",
        "label": "event.quiz.question"
      },
      "event_track_id": {
        "type": "many2one",
        "label": "event.track"
      },
      "event_id": {
        "type": "many2one",
        "label": "event_id"
      },
      "repeatable": {
        "type": "boolean",
        "label": "Unlimited Tries"
      }
    }
  },
  {
    "_name": "event.quiz.question",
    "_description": "Content Quiz Question",
    "_auto": true,
    "_fields": {
      "name": {
        "type": "char",
        "label": "Question",
        "required": true
      },
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "quiz_id": {
        "type": "many2one",
        "label": "event.quiz",
        "required": true
      },
      "correct_answer_id": {
        "type": "one2many",
        "label": "event.quiz.answer"
      },
      "awarded_points": {
        "type": "integer",
        "label": "Number of Points"
      },
      "answer_ids": {
        "type": "one2many",
        "label": "event.quiz.answer"
      }
    }
  },
  {
    "_name": "event.quiz.answer",
    "_description": "Question",
    "_auto": true,
    "_fields": {
      "sequence": {
        "type": "integer",
        "label": "Sequence"
      },
      "question_id": {
        "type": "many2one",
        "label": "event.quiz.question",
        "required": true
      },
      "text_value": {
        "type": "char",
        "label": "Answer",
        "required": true
      },
      "is_correct": {
        "type": "boolean",
        "label": "Correct",
        "default": false
      },
      "comment": {
        "type": "text",
        "label": "comment"
      },
      "awarded_points": {
        "type": "integer",
        "label": "Points"
      }
    }
  },
  {
    "_name": "eventtrack",
    "_description": "eventtrack",
    "_auto": true,
    "_fields": {
      "quiz_id": {
        "type": "many2one",
        "label": "event.quiz"
      },
      "quiz_ids": {
        "type": "one2many",
        "label": "event.quiz"
      },
      "quiz_questions_count": {
        "type": "integer",
        "label": "# Quiz Questions"
      },
      "is_quiz_completed": {
        "type": "boolean",
        "label": "Is Quiz Done"
      },
      "quiz_points": {
        "type": "integer",
        "label": "Quiz Points"
      }
    },
    "_inherit": "event.track"
  },
  {
    "_name": "eventtrackvisitor",
    "_description": "eventtrackvisitor",
    "_auto": true,
    "_fields": {
      "quiz_completed": {
        "type": "boolean",
        "label": "Completed"
      },
      "quiz_points": {
        "type": "integer",
        "label": "Quiz Points"
      }
    },
    "_inherit": "event.track.visitor"
  }
];
