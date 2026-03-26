// Validation des messages de commit (Conventional Commits)
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Types autorises
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nouvelle fonctionnalite
        'fix',      // Correction de bug
        'docs',     // Documentation
        'style',    // Formatage (pas de changement de logique)
        'refactor', // Refactoring
        'test',     // Ajout ou modification de tests
        'chore',    // Maintenance (deps, CI, etc.)
        'perf',     // Amelioration de performance
        'ci',       // CI/CD
        'revert',   // Revert d'un commit
        'security', // Correction de securite
      ],
    ],
    // Longueur max du sujet
    'subject-max-length': [2, 'always', 100],
  },
};
