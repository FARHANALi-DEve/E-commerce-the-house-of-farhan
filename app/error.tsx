"use client";
export default function ErrorPage({error,reset}:{error:Error&{digest?:string};reset:()=>void}){return <div className="container empty-cart"><h2>Something went wrong.</h2><p>{process.env.NODE_ENV==="development"?error.message:"We couldn't load this page. Check your database connection or try again."}</p><button className="button button-gold" onClick={reset}>TRY AGAIN</button></div>}
