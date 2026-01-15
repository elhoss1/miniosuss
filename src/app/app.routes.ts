import { Routes } from '@angular/router';
import { MiniOsusProduct } from './page/miniosus-product/mini-products';

export const routes: Routes = [
    { path: '', component: MiniOsusProduct , title:"ميني اسس الحلوي"},
    { path: 'checkoutgomla', loadComponent:()=> import('./page/checkout gomla/checkout').then((m)=>m.CheckoutComponent) , title:"الدفع"},
    { path: 'cart', loadComponent:()=>import('./page/cart/cart').then((m)=>m.CartComponent) , title:"السلة"},
    { path: 'favorites', loadComponent:()=>import('./page/favorites/favorites').then((m)=>m.FavoritesComponent) , title:"المفضلة"},

    { path: '**', redirectTo: ''  },


];
