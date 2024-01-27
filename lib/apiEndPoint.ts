const prefix = "api";
declare type TEndPoint = "sendFCM" | "crop_image" | "trigger_noti_action";

// export const apiEndPoint = {
//     "sendFCM" : "fdf"
// }
// type TendPoint =
//   | {
//       endPoint: "trigger_noti_action";
//       id: string;
//     }
//   | {
//       endPoint: "22";
//     } ;

//     interface endPoint {
//       type: "sendFCM" | "crop_image" ;
//     }

//     interface DigitalProduct extends endPoint {
//       type: "sendFCM";
//       sizeInMb: number;
//     }
// const d: DigitalProduct = { type: "sendFCM", sizeInMb: 2};
//     interface PhysicalProduct extends endPoint {
//       type: "crop_image";
//       weightInKg: number;
//     }

export const apiEndPoint = {
  sendFCM: `${prefix}/sendFCM`,
  crop_image: `${prefix}/crop_image`,
  trigger_noti_action: `${prefix}/trigger_noti_action`,
} as const;
// const d :TendPoint= {endPoint:"trigger_noti_action",id:'fdf'}

// export function apiEndPoint(endPoint:<[keyof TendPoint]:unknown>) {
//   //   return `${prefix}/${endPoint}` as const;
// }
// apiEndPoint("");
