export function filterDaily(data: any[]) {
  const today = new Date().toISOString().slice(0, 10);
  return data.filter(r => r.data.slice(0, 10) === today);
}

export function filterWeekly(data: any[]) {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - 7);

  return data.filter(r => {
    const d = new Date(r.data);
    return d >= past && d <= now;
  });
}

export function filterMonthly(data: any[]) {
  const now = new Date();

  return data.filter(r => {
    const d = new Date(r.data);
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });
}

export function filterSemester(data: any[]) {
  const now = new Date();
  const past = new Date();
  past.setMonth(now.getMonth() - 6);

  return data.filter(r => {
    const d = new Date(r.data);
    return d >= past && d <= now;
  });
}