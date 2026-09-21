import type {Metadata} from 'next';import './globals.css';import './yuri-redesign.css';import {config} from '@/data/site';import {Analytics} from '@/components/site/analytics';
export const metadata:Metadata={title:'Yuri Petrou | Imóveis em Búzios',description:'Conectando pessoas a paraísos.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}<Analytics/></body></html>}
