export function generateReport(data: any[]) {
  const totalReservations = data.length;

  const canceled = data.filter(r => r.status === "cancelada").length;

  const roomsUsed = new Set(data.map(r => r.sala_id)).size;

  const dailyMap: Record<string, any> = {};

  data.forEach((r) => {
    const date = r.data.slice(0, 10);

    if (!dailyMap[date]) {
      dailyMap[date] = {
        date,
        reservations: 0,
        canceled: 0,
        rooms: new Set<string>(),
      };
    }

    dailyMap[date].reservations++;

    if (r.status === "cancelada") {
      dailyMap[date].canceled++;
    }

    dailyMap[date].rooms.add(r.sala_id);
  });

  const dailyStats = Object.values(dailyMap).map((d: any) => ({
    date: d.date,
    reservations: d.reservations,
    canceled: d.canceled,
    roomsUsed: d.rooms.size,
  }));

  const reservations = data.map((r) => ({
    id: r.id,
    date: r.data.slice(0, 10),
    room: r.nome_numero,
    block: r.bloco,
    shift: r.turno,
    lesson: r.aula_numero,
    startTime: r.hora_inicio.slice(0, 5),
    endTime: r.hora_fim.slice(0, 5),
    status: r.status,
    professor: r.usuario_nome,
  }));

  return {
    summary: {
      totalReservations,
      canceled,
      roomsUsed,
    },
    dailyStats,
    reservations,
  };
}