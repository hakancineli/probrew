'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';

interface SliderProps {
  images: string[];
}

export default function ClientShowcaseSlider({ images }: SliderProps) {
  return (
    <Swiper
      modules={[Autoplay, Pagination, EffectFade]}
      effect="fade"
      spaceBetween={0}
      slidesPerView={1}
      autoplay={{ delay: 3500, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      loop={true}
      className="w-full h-full"
    >
      {images.map((src, idx) => (
        <SwiperSlide key={idx}>
          <div className="w-full h-full bg-white relative">
            <img
              src={src}
              alt={`Slide ${idx + 1}`}
              className="w-full h-full object-contain"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
