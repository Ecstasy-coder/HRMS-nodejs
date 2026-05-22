exports.daysUntilBirthday = (dob) => {

  const today = new Date();

  const birthDate = new Date(dob);

  const currentYear = today.getFullYear();

  let nextBirthday = new Date(
    currentYear,
    birthDate.getMonth(),
    birthDate.getDate()
  );

  if (nextBirthday < today) {

    nextBirthday = new Date(
      currentYear + 1,
      birthDate.getMonth(),
      birthDate.getDate()
    );

  }

  const diffTime =
    nextBirthday - today;

  return Math.ceil(
    diffTime / (1000 * 60 * 60 * 24)
  );

};