import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import gsap from 'gsap';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { mockData, TimePeriod } from '../data';
import './HistoricalDates.scss';

// @ts-ignore - SCSS module import

// Позиция активной точки (top-right, примерно 30 градусов от вертикали)
const ACTIVE_POINT_ANGLE = -60; // в градусах (отрицательный для движения по часовой стрелке от 12 часов)

const HistoricalDates: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [displayYears, setDisplayYears] = useState<{ start: number; end: number }>({
    start: mockData[0].startYear,
    end: mockData[0].endYear,
  });

  const circleRef = useRef<HTMLDivElement>(null);
  const pointsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const yearsStartRef = useRef<HTMLSpanElement>(null);
  const yearsEndRef = useRef<HTMLSpanElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  const totalPeriods = mockData.length;
  const radius = 265; // Половина от 530px
  const centerX = 265;
  const centerY = 265;

  // Вычисление позиции точки на окружности
  const getPointPosition = useCallback((index: number, total: number) => {
    const angleStep = 360 / total;
    const angle = (angleStep * index - 90) * (Math.PI / 180); // -90 чтобы начать с 12 часов
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      baseAngle: angleStep * index - 90,
    };
  }, []);

  // Анимация "бегущих цифр" для годов
  const animateYears = useCallback((newStart: number, newEnd: number) => {
    const proxy: { start: number; end: number } = { start: displayYears.start, end: displayYears.end };

    gsap.to(proxy, {
      start: newStart,
      end: newEnd,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => {
        if (yearsStartRef.current) {
          yearsStartRef.current.textContent = Math.round(proxy.start).toString();
        }
        if (yearsEndRef.current) {
          yearsEndRef.current.textContent = Math.round(proxy.end).toString();
        }
      },
    });
  }, [displayYears]);

  // Анимация вращения круга и анти-вращения точек
  const rotateCircle = useCallback((targetIndex: number) => {
    if (!circleRef.current) return;

    const targetPoint = getPointPosition(targetIndex, totalPeriods);
    
    // Вычисляем угол поворота чтобы точка оказалась в позиции ACTIVE_POINT_ANGLE
    // Кратчайший путь вращения
    let targetRotation = ACTIVE_POINT_ANGLE - targetPoint.baseAngle;
    
    // Нормализуем вращение чтобы оно было кратчайшим путем
    const currentRotationNormalized = currentRotation % 360;
    let rotationDiff = targetRotation - currentRotationNormalized;
    
    // Выбираем кратчайший путь
    if (rotationDiff > 180) {
      rotationDiff -= 360;
    } else if (rotationDiff < -180) {
      rotationDiff += 360;
    }

    const newRotation = currentRotation + rotationDiff;

    // Анимация вращения круга
    gsap.to(circleRef.current, {
      rotation: newRotation,
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (circleRef.current) {
          circleRef.current.style.transform = `rotate(${newRotation}deg)`;
        }
      },
      onComplete: () => {
        setCurrentRotation(newRotation);
      },
    });

    // Анти-вращение для всех точек (чтобы цифры не переворачивались)
    pointsRefs.current.forEach((point) => {
      if (point) {
        gsap.to(point, {
          rotation: -newRotation,
          duration: 0.8,
          ease: 'power2.inOut',
        });
      }
    });
  }, [currentRotation, getPointPosition, totalPeriods]);

  // Анимация смены контента слайдера
  const animateSliderContent = useCallback(() => {
    if (!sliderContainerRef.current) return;

    const slides = sliderContainerRef.current.querySelectorAll('.swiper-slide');
    
    // Скрываем текущий слайд
    gsap.to(slides, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      stagger: 0.05,
      onComplete: () => {
        // После скрытия показываем новый контент
        gsap.to(slides, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          delay: 0.2,
        });
      },
    });
  }, []);

  // Обработчик переключения периода
  const handlePeriodChange = useCallback((newIndex: number) => {
    if (newIndex === activeIndex || newIndex < 0 || newIndex >= totalPeriods) return;

    const newPeriod = mockData[newIndex];

    // Анимация годов
    animateYears(newPeriod.startYear, newPeriod.endYear);

    // Вращение круга
    rotateCircle(newIndex);

    // Анимация слайдера
    animateSliderContent();

    // Обновление активного индекса
    setActiveIndex(newIndex);
  }, [activeIndex, totalPeriods, animateYears, rotateCircle, animateSliderContent]);

  // Навигация вперед/назад
  const handlePrev = useCallback(() => {
    handlePeriodChange(activeIndex - 1);
  }, [activeIndex, handlePeriodChange]);

  const handleNext = useCallback(() => {
    handlePeriodChange(activeIndex + 1);
  }, [activeIndex, handlePeriodChange]);

  // Инициализация при монтировании
  useEffect(() => {
    setDisplayYears({
      start: mockData[0].startYear,
      end: mockData[0].endYear,
    });
  }, []);

  // Обработка изменения слайда в Swiper
  const handleSwiperSlideChange = useCallback((swiper: any) => {
    const newIndex = swiper.activeIndex;
    if (newIndex !== activeIndex) {
      handlePeriodChange(newIndex);
    }
  }, [activeIndex, handlePeriodChange]);

  // Ref callback for points
  const setPointRef = useCallback((index: number, el: HTMLDivElement | null) => {
    pointsRefs.current[index] = el;
  }, []);

  return (
    <div className="historical-dates">
      {/* Декоративные линии фона */}
      <div className="historical-dates__bg-lines"></div>

      <div className="historical-dates__container">
        {/* Заголовок */}
        <header className="historical-dates__header">
          <h1 className="historical-dates__title">Исторические даты</h1>
          
          {/* Годы */}
          <div className="historical-dates__years">
            <span 
              ref={yearsStartRef} 
              className="historical-dates__years-start"
            >
              {displayYears.start}
            </span>
            <span className="historical-dates__years-separator">—</span>
            <span 
              ref={yearsEndRef} 
              className="historical-dates__years-end"
            >
              {displayYears.end}
            </span>
          </div>
        </header>

        {/* Основной контент */}
        <main className="historical-dates__main">
          {/* Круг с точками (Desktop) */}
          <div className="historical-dates__circle-container">
            {/* Навигация слева */}
            <div className="historical-dates__navigation">
              <button 
                className="historical-dates__nav-btn" 
                onClick={handlePrev}
                disabled={activeIndex === 0}
                aria-label="Предыдущий период"
              >
                <svg viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className="historical-dates__counter">
                {String(activeIndex + 1).padStart(2, '0')}/{String(totalPeriods).padStart(2, '0')}
              </span>
              <button 
                className="historical-dates__nav-btn" 
                onClick={handleNext}
                disabled={activeIndex === totalPeriods - 1}
                aria-label="Следующий период"
              >
                <svg viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Вращающийся круг */}
            <div 
              ref={circleRef}
              className="historical-dates__circle"
            >
              {mockData.map((period, index) => {
                const position = getPointPosition(index, totalPeriods);
                const isActive = index === activeIndex;

                return (
                  <div
                    key={period.id}
                    ref={(el) => setPointRef(index, el)}
                    className={`historical-dates__point ${isActive ? 'historical-dates__point--active' : ''}`}
                    style={{
                      left: `${position.x}px`,
                      top: `${position.y}px`,
                    }}
                    onClick={() => handlePeriodChange(index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handlePeriodChange(index);
                      }
                    }}
                    aria-label={`Период: ${period.title}`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span className="historical-dates__point-number">
                      {index + 1}
                    </span>
                    <span className="historical-dates__point-label">
                      {period.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Название категории */}
          <div className="historical-dates__category">
            <h2 className="historical-dates__category-title">
              {mockData[activeIndex].title}
            </h2>
          </div>

          {/* Слайдер событий */}
          <div 
            ref={sliderContainerRef}
            className="historical-dates__slider-container"
          >
            <Swiper
              modules={[Pagination, Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              pagination={{ 
                clickable: true,
                el: '.historical-dates__pagination',
              }}
              navigation={false}
              initialSlide={activeIndex}
              onSlideChange={handleSwiperSlideChange}
              className="historical-dates__slider"
              allowTouchMove={true}
            >
              {mockData.map((period) => (
                <SwiperSlide key={period.id}>
                  <div className="historical-dates__event-card">
                    {period.events.map((event, eventIndex) => (
                      <React.Fragment key={`${period.id}-${eventIndex}`}>
                        <div className="historical-dates__event-year">
                          {event.year}
                        </div>
                        <div className="historical-dates__event-text">
                          {event.text}
                        </div>
                        {eventIndex < period.events.length - 1 && (
                          <div style={{ height: '20px' }} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Пагинация для мобильной версии */}
          <div className="historical-dates__pagination"></div>
        </main>
      </div>
    </div>
  );
};

export default HistoricalDates;
