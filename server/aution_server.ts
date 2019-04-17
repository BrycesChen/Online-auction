import * as express from "express"
import * as path from "path";
import {Server} from "ws";

const app = express();

export class Product {
    constructor(
        public id:number,
        public title:string,
        public price:number,
        public rating:number,
        public desc:string,
        public categories:Array<string>
    ) {

    }
}
const products: Product[] = [
    new Product(1,"��һ����Ʒ",1.99,3.5,"��һ����Ʒ������",["���Ӳ�Ʒ","Ӳ���豸"]),
    new Product(2,"�ڶ�����Ʒ",2.99,2.5,"�ڶ�����Ʒ������",["Ӳ���豸"]),
    new Product(3,"��������Ʒ",3.99,3.5,"��������Ʒ������",["ͼ��","Ӳ���豸"]),
    new Product(4,"���ĸ���Ʒ",4.99,4.5,"���ĸ���Ʒ������",["������Ʒ","Ӳ���豸"]),
    new Product(5,"�������Ʒ",5.99,1.5,"�������Ʒ������",["�����豸","ʳƷ"]),
    new Product(6,"��������Ʒ",6.99,3.5,"��������Ʒ������",["������Ʒ","���ó���"])
];
export class Comment {
    constructor(
        public id: number,
        public productId: number,
        public timestamp: string,
        public user: string,
        public rating: number,
        public content: string
    ) {}
}


const comments: Comment[] =[
    new Comment(1, 1, "2019-03-27 11:50:55","Bryce1", 3, "�����ܲ���"),
    new Comment(2, 1, "2019-03-26 10:51:54","Bryce2", 3.5, "��������"),
    new Comment(3, 1, "2019-03-25 09:52:53","Bryce3", 2, "����������"),
    new Comment(4, 2, "2019-03-24 08:53:52","Bryce4", 4, "������������"),
    new Comment(5, 2, "2019-03-22 07:54:51","Bryce5", 4.5, "�����ú���"),
]

app.use('/', express.static(path.join(__dirname, '..', 'client')))

app.get('/api/products',function(req, res) {
    var result = products;
    var params = req.query;
    console.log(params);
    if (params.title) {
        result = result.filter(function(p) {
            return p.title.indexOf(params.title) != -1;
        })
    }

    if (params.price && result.length > 0) {
        result = result.filter(function(p) {
            return p.price <= params.price;
        })
    }

    if (params.category && params.category != '-1' && result.length > 0) {
        result = result.filter(function(p) {
            console.log(p.categories);
            console.log(params.category);
            return p.categories.indexOf(params.category) != -1;
        })
    }

    res.json(result);
})

app.get('/api/product/:id', (req, res) => {
    res.json(products.find((product) => product.id == req.params.id));
})

app.get('/api/product/:id/comments', (req, res) => {
    res.json(comments.filter((comment: Comment) => comment.productId == req.params.id));
})

const server = app.listen(8000, "localhost", () => {
    console.log("�������������� ��ַ�ǣ�http://localhost:8000")
})

const subscriptions = new Map<any, number[]>()
const wsServer = new Server({port: 8085});
wsServer.on('connection', (websocket) => {
    websocket.on('message', (message) => {
        // ���ͻ�������Ϣ����ʱ�����������˽��գ���������ͻ��˴��ݸ���JSON.stringify({productId:id});�����ڽӵ�����ʱ��ʹ��
        // JSON.parse(message);
        let messageObj = JSON.parse(message);
        // keyֵ�����ӵ�����˵Ŀͻ��ˣ���subscripitons.get(websocket)��ֵΪundefined����ֵΪ������;
        let productIds = subscriptions.get(websocket) || [];
        // ���µ���Ʒ��Id�ŵ�ֵ��������;�����еĺ��½���id�����һ��;
        subscriptions.set(websocket, [...productIds, messageObj.productId]); // [...productIds]: ��չ�����
    })
})

const currentBids = new Map<number,number>()

setInterval(function() {
    // �������ÿ����Ʒ�����µ���Ʒ�ļ۸�
    products.forEach((product) => {
        let currentBid = currentBids.get(product.id) || product.price;
        let newBid = currentBid + Math.random() * 5;
        currentBids.set(product.id, newBid);
    })
    // ѭ��ÿһ���ͻ���, ����ÿһ���ͻ��˹�ע����Ʒ�ļ۸�
    subscriptions.forEach((productIds: number[], ws) => {
        // ���ص����ݵĸ�ʽ�ǣ�[{productId:xxx,bid: xxx},{},{}],��Ӧ��ÿ������ע����Ʒ�����µı���
        // *** ��ֹҳ��ˢ�±���;
        if (ws.readyState === 1) {
            //    ͨ��ӳ�佫pid���{productId: pid, bid: currentBid.get(pid)}
            let newBids = productIds.map(pid => ({
                productId: pid,
                bid: currentBids.get(pid)
            }));
            // ���͵�����
            ws.send(JSON.stringify(newBids));
        } else {
            subscriptions.delete(ws); // ɾ���Ѿ��رյĿͻ���
        }
        // ��֮��Ȼ���ڿͻ��˶��������;
    });
}, 2000);






