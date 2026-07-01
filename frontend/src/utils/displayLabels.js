export const displayWorkflowText = (value) => {
  if (!value) return '';

  return String(value)
    .replace(/Support/g, 'HelpDesk')
    .replace(/SUPPORT/g, 'HELPDESK')
    .replace(/Developer/g, 'Level_2')
    .replace(/DEVELOPER/g, 'LEVEL_2')
    .replace(/Development/g, 'Level_2')
    .replace(/DEVELOPMENT/g, 'LEVEL_2');
};

export const displayRole = (role) => {
  if (role === 'SUPPORT') return 'HelpDesk';
  if (role === 'DEVELOPER') return 'devoloper';
  return role || '';
};
