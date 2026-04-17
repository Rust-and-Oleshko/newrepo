export interface HistoricalEvent {
  year: number;
  text: string;
}

export interface TimePeriod {
  id: number;
  title: string;
  startYear: number;
  endYear: number;
  events: HistoricalEvent[];
}

export const mockData: TimePeriod[] = [
  {
    id: 1,
    title: "Технологии",
    startYear: 1980,
    endYear: 1986,
    events: [
      { year: 1980, text: "Sinclair Research выпускает ZX80" },
      { year: 1982, text: "Появился домашний компьютер ZX Spectrum" },
      { year: 1984, text: "Выпуск Apple Macintosh" },
      { year: 1985, text: "Microsoft выпускает Windows 1.0" }
    ]
  },
  {
    id: 2,
    title: "Кино",
    startYear: 1987,
    endYear: 1991,
    events: [
      { year: 1987, text: "Премьера фильма «Хищник»" },
      { year: 1988, text: "«Кто подставил кролика Роджера»" },
      { year: 1990, text: "«Крепкий орешек 2»" },
      { year: 1991, text: "«Терминатор 2: Судный день»" }
    ]
  },
  {
    id: 3,
    title: "Литература",
    startYear: 1992,
    endYear: 1997,
    events: [
      { year: 1992, text: "Нобелевская премия по литературе — Дерек Уолкотт" },
      { year: 1994, text: "Выход романа «Бессонница» Стивена Кинга" },
      { year: 1997, text: "Первая книга о Гарри Поттере" }
    ]
  },
  {
    id: 4,
    title: "Наука",
    startYear: 2015,
    endYear: 2022,
    events: [
      { year: 2015, text: "Обнаружение гравитационных волн" },
      { year: 2019, text: "Первое фото черной дыры" },
      { year: 2021, text: "Запуск телескопа Джеймс Уэбб" }
    ]
  }
];
