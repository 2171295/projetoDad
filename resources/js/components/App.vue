<template>
    <div >
        <aux_snackbar :text="text" :snackbar="snackbar" :color="color"/>
        <aux_shopping_cart ref="shoppingCart"/>

        <v-app v-if="!this.$store.state.user">
            <v-app-bar :clipped-left="true" fixed app color="deep-orange lighten-1" >
                <v-btn icon to="/">
                    <v-icon>{{ iconHome }}</v-icon>
                </v-btn>
                <v-spacer />
                <v-toolbar-title class="white--text" v-text="title" />
                <v-spacer />
                <v-btn depressed small color="deep-orange lighten-1" @click="redirectRegister" class="white--text" style="margin-right: 10px;">
                    Register
                </v-btn>
                <v-btn depressed small color="deep-orange lighten-1" @click="redirectLogin" class="white--text" >
                    Login
                </v-btn>
            </v-app-bar>
            <v-main>
                <v-container fluid>
                    <router-view></router-view>
                </v-container>
            </v-main>
        </v-app>
        <v-app v-else>
            <v-navigation-drawer v-model="drawer" :mini-variant="miniVariant" :clipped="clipped" fixed app color="grey lighten-1"  v-if="this.$store.state.user.type === 'EM'">
                <v-card class="mx-auto" max-width="500">
                    <v-list>
                        <v-list-item
                            v-for="(item, i) in items"
                            :key="i"
                            :to="item.to"
                            router
                            exact
                            :disabled="item.active"
                        >
                            <v-list-item-action>
                                <v-icon>{{ item.icon }}</v-icon>
                            </v-list-item-action>
                            <v-list-item-content>
                                <v-list-item-title v-text="item.title" />
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card>

            </v-navigation-drawer>
            <v-app-bar :clipped-left="clipped" fixed app color="deep-orange lighten-1">
                <v-btn @click.stop="drawer = !drawer" icon  v-if="this.$store.state.user.type === 'EM'">
                    <v-icon>{{iconMenu}}</v-icon>
                </v-btn>
                <v-btn icon @click.stop="miniVariant = !miniVariant"  v-if="this.$store.state.user.type === 'EM'">
                    <template v-if="miniVariant">
                        <v-icon>{{iconChevronRight}}</v-icon>
                    </template>
                    <template v-if="!miniVariant">
                        <v-icon>{{iconChevronLeft}}</v-icon>
                    </template>
                </v-btn>
                <v-btn icon to="/home">
                    <v-icon>{{ iconHome }}</v-icon>
                </v-btn>
                <v-spacer />
                <v-toolbar-title class="white--text" v-text="title" />
                <v-spacer />
                <v-btn icon v-if="$store.state.user.type === 'C'" @click="shoppingCart">
                    <v-icon>mdi-cart</v-icon>
                </v-btn>
                <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on">
                            <v-icon>{{ iconAccount }}</v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item @click="toProfile">
                            <v-icon>{{iconAccount}}</v-icon>Profile
                        </v-list-item>
                        <v-list-item @click="logout">
                            <v-icon>{{iconLogout}}</v-icon>Logout
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-app-bar>
            <v-main>
                <v-container>
                    <router-view></router-view>
                </v-container>
            </v-main>
        </v-app>

    </div>
</template>

<script>
import aux_shopping_cart from "./auxiliares/aux_shopping_cart";
import { mdiHome, mdiAccount, mdiLogout, mdiChevronRight, mdiChevronLeft, mdiMenu} from '@mdi/js'
import Aux_snackbar from "./auxiliares/aux_snackbar";
import aux_dialog_notification from "./auxiliares/aux_dialog_notification";
export default {
    name: "App",
    data() {
        return {
            // ---- SNACKBAR INFO -----
            color: '',
            snackbar: false,
            text: '',
            // ------------------------

            iconHome: mdiHome,
            iconAccount: mdiAccount,
            iconLogout: mdiLogout,
            iconChevronRight: mdiChevronRight,
            iconChevronLeft: mdiChevronLeft,
            iconMenu: mdiMenu,
            title: "Food@Home",
            clipped: true,
            drawer: false,
            fixed: true,
            email:'',
            miniVariant: false,
            right: true,
            rightDrawer: false,
            selected:'',
            cart:[],
            items: [
                {
                    action: 'mdi-silverware-fork-knife',
                    // active: true,
                    items: [{ title: 'List' }],
                    to: '/users',
                    title: 'Users',
                },
                {
                    action: 'mdi-school',
                    items: [{ title: 'List' }],
                    title: 'Products',
                    to: '/products'
                },
                {
                    action: 'mdi-chart-areaspline',
                    to: '/statistics',
                    title: 'Statistics',
                },
            ],
        }
    },methods:{
        redirectRegister(){
            this.$router.push("/register")
        },
        redirectLogin(){
            this.$router.push("/login")
        },
        async shoppingCart(){
            if (await this.$refs.shoppingCart.open()) {
            }else{
                return null;
            }
        },
        logout(){
            axios.post("/api/logout").then((response)=>{
                axios.put("api/users/"+this.$store.state.user.id+"/logout");
                this.$store.commit("clearUserAndToken");
                this.$store.commit('clearLoggedAt');
                this.$nextTick()
                    .then(() => {
                        this.$router.push("/")
                    })
            }).catch((error)=>{
                console.log(error)
            })

        },
        toProfile(){
            this.$router.push("/profile")
        },

        defineCooker(cooker,order){
            axios.put('api/orders/' + order.id + '/cook', {
                cooker: cooker
            })
                .then(() => {
                    console.log("Order is being prepared by " + cooker.name)
                    this.$socket.emit('order_assign_cook',cooker);
                    //enviar notificação ao cooker
                    axios.put('api/users/' + cooker.id + '/not_available')
                        .then(() => {
                            //notificar user
                            //this.notification(cooker);
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                })
                .catch((error) => {
                    console.log(error);
                })
        },
    },
    sockets: {
        user_blocked(user_blocked) {
            if(this.$store.state.user.id===user_blocked.id){
                this.color = 'blue';
                this.text = "Your account has been blocked Logging out..."
                this.snackbar = true;
                setTimeout(() => {
                    this.snackbar = false;
                }, 2000);
                this.logout();
            }

        },
        order_created(order) {
            //verificar se há cookers disponiveis
            axios.get('api/users/available_cookers')
                .then((response) => {
                    let cooker = response.data;
                    if (cooker) {
                        this.defineCooker(cooker,order)
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        },
        user_logged(user) {
            switch (user.type) {
                //verifica se o user é um cooker
                case ('EC'):
                    //verifica se há holding orders
                    axios.get('api/orders/holding')
                        .then((response) => {
                            console.log("Check holding orders")
                            let order = response.data.data;
                            if(order){
                                this.defineCooker(user,order)
                            }
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                    break;
            }

        },
        user_available(user) {
            switch (user.type) {
                //verifica se o user é um cooker
                case ('EC'):
                    //verifica se há holding orders
                    axios.get('api/orders/holding')
                        .then((response) => {
                            let order = response.data.data;
                            if(order){
                                this.defineCooker(user,order)
                            }
                        })
                        .catch(() => {
                            console.log(error)
                        })
                    break;
            }

        },
        connect () {
            // If user is logged resend the message user_logged
            if (this.$store.state.user) {
                axios.put("api/users/" + this.$store.state.user.id + "/logged")
                .then((response)=>{
                    this.$store.dispatch('setUser',response.data.data)
                    this.$socket.emit('user_logged', this.$store.state.user)
                })
                .catch((error)=>{
                    console.log(error)
                })
            }
        },
        user_disconnect(user){
            axios.put("api/users/"+user.id+"/logout")
            .then((response)=>{
                console.log("User Disconnect")
            })
            .catch((error)=>{
                console.log(error)
            })
        }
    },
    components:{
        Aux_snackbar,
        aux_shopping_cart,
    },
    created() {
        this.$store.commit('loadLoggetAt');
    }

}
</script>

<style scoped>

</style>
