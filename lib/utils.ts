export const money = (value:number) => `Rs. ${value.toLocaleString("en-PK")}`;
export const orderDate = (value:string) => new Date(value).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"});
export async function api<T>(url:string, options?:RequestInit):Promise<T> {
  let response:Response;
  try { response=await fetch(url,{...options,headers:{...(options?.body?{"Content-Type":"application/json"}:{}),...options?.headers}}); }
  catch { throw Error("Network error. Check your connection and try again."); }
  const data=await response.json().catch(()=>({}));
  if (!response.ok) throw Error(data.error || `Request failed (${response.status})`);
  return data as T;
}
