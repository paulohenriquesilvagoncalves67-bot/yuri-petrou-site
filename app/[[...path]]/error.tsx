'use client';
export default function PublicError({reset}:{error:Error;reset:()=>void}){
  return <main className="notfound" role="alert"><p className="eyebrow">YURI PETROU</p><h1>Não foi possível carregar os imóveis agora.</h1><p>Seu acesso continua seguro. Tente novamente em instantes.</p><button className="button" onClick={reset}>Tentar novamente</button></main>;
}
