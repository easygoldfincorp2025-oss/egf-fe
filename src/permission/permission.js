export const getResponsibilityValue = (key, configs, user) => {
  if (!user || !configs) {
    console.error('User or configs are undefined');
    return null;
  }

  if (user.role !== 'Admin') {
    const responsibilities = configs.permissions?.[user.role];
    if (!responsibilities) {
      console.error(`No permissions found for role "${user.role}"`);
      return null;
    }

    const userResponsibilities = responsibilities.responsibilities;
    if (userResponsibilities?.hasOwnProperty(key)) {
      return userResponsibilities[key];
    } else {
      console.error(`Key "${key}" does not exist in responsibilities`);
      return null;
    }
  } else {
    return true;
  }
};
