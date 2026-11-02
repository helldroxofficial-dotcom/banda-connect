import atta from "@/assets/grocery-atta.jpg";
import rice from "@/assets/grocery-rice.jpg";
import pulses from "@/assets/grocery-pulses.jpg";
import mustardOil from "@/assets/grocery-mustard-oil.jpg";
import ghee from "@/assets/grocery-ghee.jpg";
import spices from "@/assets/grocery-spices.jpg";
import salt from "@/assets/grocery-salt.jpg";
import sugar from "@/assets/grocery-sugar.jpg";
import tea from "@/assets/grocery-tea.jpg";
import milk from "@/assets/grocery-milk.jpg";
import butter from "@/assets/grocery-butter.jpg";
import eggs from "@/assets/grocery-eggs.jpg";
import biscuits from "@/assets/grocery-biscuits.jpg";
import namkeen from "@/assets/grocery-namkeen.jpg";
import momos from "@/assets/street-momos.jpg";
import samosa from "@/assets/street-samosa.jpg";
import tikki from "@/assets/street-tikki.jpg";
import golgappe from "@/assets/street-golgappe.jpg";
import shopSweets from "@/assets/shop-sweets.jpg";
import shopGeneral from "@/assets/shop-general.jpg";
import shopBooks from "@/assets/shop-books.jpg";
import plumber from "@/assets/worker-plumber.jpg";
import electrician from "@/assets/worker-electrician.jpg";
import mechanic from "@/assets/worker-mechanic.jpg";
import carpenter from "@/assets/worker-carpenter.jpg";
import doctor1 from "@/assets/doctor-1.jpg";
import doctor2 from "@/assets/doctor-2.jpg";
import skillRepair from "@/assets/skill-repair.jpg";
import skillPhotographer from "@/assets/skill-photographer.jpg";
import skillDeveloper from "@/assets/skill-developer.jpg";
import restaurantAnand from "@/assets/restaurant-anand.jpg";
import restaurantZaika from "@/assets/restaurant-zaika.jpg";
import runner from "@/assets/runner.jpg";

export const IMAGES: Record<string, string> = {
  "grocery-atta": atta,
  "grocery-rice": rice,
  "grocery-pulses": pulses,
  "grocery-mustard-oil": mustardOil,
  "grocery-ghee": ghee,
  "grocery-spices": spices,
  "grocery-salt": salt,
  "grocery-sugar": sugar,
  "grocery-tea": tea,
  "grocery-milk": milk,
  "grocery-butter": butter,
  "grocery-eggs": eggs,
  "grocery-biscuits": biscuits,
  "grocery-namkeen": namkeen,
  "street-momos": momos,
  "street-samosa": samosa,
  "street-tikki": tikki,
  "street-golgappe": golgappe,
  "shop-sweets": shopSweets,
  "shop-general": shopGeneral,
  "shop-books": shopBooks,
  "worker-plumber": plumber,
  "worker-electrician": electrician,
  "worker-mechanic": mechanic,
  "worker-carpenter": carpenter,
  "doctor-1": doctor1,
  "doctor-2": doctor2,
  "skill-repair": skillRepair,
  "skill-photographer": skillPhotographer,
  "skill-developer": skillDeveloper,
  "restaurant-anand": restaurantAnand,
  "restaurant-zaika": restaurantZaika,
  "runner": runner,
};

export function img(key: string | null | undefined): string {
  if (!key) return atta;
  return IMAGES[key] ?? atta;
}
