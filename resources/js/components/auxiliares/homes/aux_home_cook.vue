<template>
    <v-container>
        <aux_snackbar :text="text" :snackbar="snackbar" :color="color"/>
        <aux_dialog_confirmacao ref="confirm"/>
        <aux_dialog_notification ref="notification"/>
        <v-row>
            <v-col>
                <p><b>Working Time: {{working_time}} minutes</b></p>
                <v-toolbar class="d-flex justify-center align-center" style="margin-bottom: 20px;">
                    <v-toolbar-title>Order Being Prepared</v-toolbar-title>
                </v-toolbar>
                <template v-if="order">
                    <v-card>
                        <v-card-text>
                            <v-row>
                                <v-col>
                                    <p><b>ID: </b>{{ order.id }}</p>
                                    <p><b>Customer: </b>{{ order.customer.user.name }}</p>
                                    <p><b>Customer Notes: </b>{{ order.notes }}</p>
                                </v-col>
                                <v-col>
                                    <p><b>Started At: </b>{{ order.current_status_at }}</p>
                                    <p><b>Preparation Time: </b>{{ preparation_time }} minutos</p>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                    <v-card style="margin-top: 10px">
                        <v-card-text>
                            <!--                        Lista com os Items da Order-->
                            <v-toolbar style="margin-bottom: 10px;">
                                <v-text-field label="Search:" v-model="search"></v-text-field>
                            </v-toolbar>
                            <v-card-text>
                                <v-data-table
                                    :headers="headers"
                                    :items="order_items"
                                    :items-per-page="10"
                                    class="elevation-1"
                                    :search="search"
                                >
                                    <template v-slot:item.img="{ item }">
                                        <v-img :src="'/storage/products/'+item.product.photo_url" width="100px" height="100px"
                                               style="border-radius: 50%"/>
                                    </template>
                                </v-data-table>
                            </v-card-text>
                            <v-btn @click="finishOrder">Finish</v-btn>
                        </v-card-text>
                    </v-card>
                </template>
                <template v-else>
                    <v-card>
                        <v-card-text>
                            <p><b>You have no order assign</b></p>
                        </v-card-text>
                    </v-card>
                </template>

            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import Aux_snackbar from "../aux_snackbar";
import Aux_dialog_confirmacao from "../aux_dialog_confirmacao";
import Aux_dialog_notification from "../aux_dialog_notification";
export default {
    name: "aux_home_cook",
    components: {Aux_dialog_notification, Aux_dialog_confirmacao, Aux_snackbar},
    data: () => {
        return {
            // ---- SNACKBAR INFO -----
            color: '',
            snackbar: false,
            text: '',
            // ------------------------

            order:'',
            preparation_time:'',
            working_time:'',
            order_items: [],

            search:'',
            headers: [
                {text: '', value: 'img'},
                {text: 'Name', align: 'start', sortable: true, value: 'product.name',},
                {text: 'Type', align: 'start', sortable: true, value: 'product.type',},
                {text: 'Quantity', align: 'start', sortable: true, value: 'quantity',},
                {text: 'Description', align: 'start', sortable: false, value: 'product.description',},
            ],
        }
    },
    methods: {
        getOrderBeingPrepared() {
            axios.get('api/orders/preparedby/' + this.$store.state.user.id)
                .then((response) => {
                    if (response.data.data) {
                        console.log(response.data.data)
                        this.order = response.data.data;
                        this.timeCounters();
                        axios.get('api/orders_items/order/' + this.order.id)
                            .then((response) => {
                                this.order_items = response.data.data;
                            })
                            .catch(() => {
                                this.color = 'red';
                                this.text = "Error getting order items."
                                this.snackbar = true;
                                setTimeout(() => {
                                    this.snackbar = false;
                                }, 2000);
                            })
                    }
                })
                .catch(() => {
                    this.color = 'red';
                    this.text = "Error getting order being prepared."
                    this.snackbar = true;
                    setTimeout(() => {
                        this.snackbar = false;
                    }, 2000);
                })
        },
        async finishOrder() {
            if (await this.$refs.confirm.open(
                "Finish Cooking",
                "Are you sure the order is completed ?")
            ) {
                axios.put('/api/orders/' + this.order.id + '/cooked', {
                    preparation_time: this.preparation_time
                })
                    .then(() => {
                        this.snackbar = true;
                        this.text = "Order finished."
                        this.color = "green"
                        setTimeout(() => {
                            this.snackbar = false;
                        }, 2000);
                        this.$socket.emit('order_cooked', this.order)
                        this.getOrderBeingPrepared();
                        axios.put('api/users/' + this.$store.state.user.id + '/available')
                            .then(() => {
                                this.$socket.emit('user_available', this.$store.state.user)
                                this.getOrderBeingPrepared();
                            })
                            .catch((error) => {
                                console.log(error)
                                this.color = 'red';
                                this.text = "Error setting you available."
                                this.snackbar = true;
                                setTimeout(() => {
                                    this.snackbar = false;
                                }, 2000);
                            })
                    })
                    .catch((error) => {
                        console.log(error)
                        this.color = 'red';
                        this.text = "Error finishing order."
                        this.snackbar = true;
                        setTimeout(() => {
                            this.snackbar = false;
                        }, 2000);
                    })
            }
        },
        timeCounters() {
            let start = new Date(this.order.current_status_at);
            let now = new Date()
            this.preparation_time = Math.floor((now - start) / (1000 * 60));
            start = new Date(this.$store.state.user_logged_at);
            this.working_time = Math.floor((now - start) / (1000 * 60));
        },
        async notification(title,message){
            await this.$refs.notification.open(title,message)
        },
    },
    sockets:{
        order_assign_cook(user){
            if(user.id === this.$store.state.user.id){
                this.getOrderBeingPrepared();
                this.notification("New Order", "New Order has been assign!");
            }
        },
        order_canceled(order){
            if(order.id === this.order.id){
                this.getOrderBeingPrepared();
                this.notification("Order "+ order.id +" canceled", "Your current order has canceled by the manager!");
            }
        }
    },
    created() {
        this.getOrderBeingPrepared();
        setInterval(this.timeCounters,61000)
    },
}
</script>

<style scoped>

</style>
