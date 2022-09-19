export const addZeroToNumber = (num)=>{
  return num < 10 ? `0${num}` : String(num);
}