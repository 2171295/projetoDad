import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex);

import axios from "axios"

export default new Vuex.Store({
    state: {
        token: "",
        user: null,
        menu_items:[],
        menu_search:'',
        cart:[],
    },
    mutations: {
        clearUserAndToken (state) {
            if (state.user) {
                this._vm.$socket.emit('user_logged_out', state.user)
            }
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("token");
            axios.defaults.headers.common.Authorization = undefined;
            state.user = null;
            state.token = "";
        },
        clearUser (state) {
            if (state.user) {
                this._vm.$socket.emit('user_logged_out', state.user)
            }
            state.user = null;
            sessionStorage.removeItem("user");
        },
        clearToken (state) {
            state.token = "";
            sessionStorage.removeItem("token");
            axios.defaults.headers.common.Authorization = undefined;
        },
        setUser (state, user) {
            if (state.user !== user) {
                if (state.user) {
                    this._vm.$socket.emit('user_logged_out', state.user)
                }
                state.user = user
                sessionStorage.setItem("user", JSON.stringify(user));
                if (state.user) {
                    this._vm.$socket.emit('user_logged', state.user)
                }
            }
        },
        setToken (state, token) {
            state.token = token;
            sessionStorage.setItem("token", token);
            axios.defaults.headers.common.Authorization = "Bearer " + token;
        },
        loadTokenAndUserFromSession (state) {
            state.token = "";
            state.user = null;
            let token = sessionStorage.getItem("token");
            let user = sessionStorage.getItem("user");
            if (token) {
                state.token = token;
                axios.defaults.headers.common.Authorization = "Bearer " + token;
            } else {
                axios.defaults.headers.common.Authorization = undefined;
            }
            if (user) {
                state.user = JSON.parse(user);
            }
        },
        setMenuItems (state, list) {
                state.menu_items = list;
        },
        setMenuSearch (state, type) {
            state.menu_search = type;
        },
        // Mutations to handle Cart
        clearCart (state) {
            state.cart = []
            localStorage.removeItem('cart')
        },
        setCart (state, cart) {
            state.cart = cart
            localStorage.setItem('cart', state.cart)
        },
        addItemToCart (state, itemCart) {
            state.cart.push(itemCart)
            localStorage.setItem('cart', state.cart)
        },
    },
    actions: {
        rebuildUserFromStorage (context) {
            if (sessionStorage.getItem('token') !== null && sessionStorage.getItem('user') !== null){
                context.commit("loadTokenAndUserFromSession")
            }
        },
        setUser (context,user) {
            context.commit("setUser",user)
        },
        rebuildCartFromStorage (context) {
            if (localStorage.getItem('cart') === null) {
                context.commit('clearCart')
            } else {
                context.commit('setCart', localStorage.getItem('cart'))
            }
        },
    }
});
