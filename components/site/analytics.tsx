'use client';
import {useEffect} from 'react';import {config} from '@/data/site';
// TODO: ativar IDs reais apenas após definir a política de consentimento. Meta Pixel tem configuração central reservada.
export function Analytics(){useEffect(()=>{if(!config.gaId||!/^G-[A-Z0-9]+$/.test(config.gaId)||localStorage.getItem('analytics-consent')!=='granted')return;const w=window as any;w.dataLayer=w.dataLayer||[];w.gtag=function(){w.dataLayer.push(arguments)};w.gtag('js',new Date());w.gtag('config',config.gaId);const script=document.createElement('script');script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${config.gaId}`;document.head.appendChild(script);return()=>{script.remove()}},[]);return null}
