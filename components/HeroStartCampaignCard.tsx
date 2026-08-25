'use client';

import { useState } from 'react';
import { startCampaignLink } from '@/lib/config';

// Tarjeta del hero: arranque de campaña. Pide lo mínimo (quién eres y qué
// campaña quieres) y salta al registro del app con eso ya cargado. El resto
// —teléfono, RUC, organización, meta, historia— se llena en el formulario real.

export function HeroStartCampaignCard() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');

  const href = startCampaignLink({
    name: name.trim(),
    email: email.trim(),
    title: title.trim(),
  });

  return (
    <div className="donateCard" id="iniciar">
      <div className="donateCardHead">Inicia tu campaña</div>

      {/* Manos unidas: la foto dice lo mismo que la marca (nos x otros).
          Unsplash, licencia libre — /public/hero-campana.jpg */}
      <div className="donateCardMedia">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-campana.jpg" alt="Personas juntando las manos" className="donateCardPhoto" />
      </div>

      <div className="donateCardBody">
        <div className="donateFieldRow">
          <div>
            <label className="donateLabel" htmlFor="heroName">
              Nombre
            </label>
            <input
              id="heroName"
              className="donateInput"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="donateLabel" htmlFor="heroEmail">
              Correo
            </label>
            <input
              id="heroEmail"
              type="email"
              className="donateInput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label className="donateLabel" htmlFor="heroTitle">
            ¿Qué campaña quieres crear?
          </label>
          <input
            id="heroTitle"
            className="donateInput"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Techo para 20 familias"
          />
        </div>

        <a href={href} className="btn btnOrange donateSubmit">
          Crear campaña
        </a>
        <p className="donateNote">Sigues en el registro con estos datos ya cargados. Gratis, toma minutos.</p>
      </div>
    </div>
  );
}
