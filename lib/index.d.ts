import { EventEmitter } from 'events';
import SendStatus = require('./producer/send_status');

declare class Message {
    constructor(topic: string, tags?: string, body?: string | Buffer);
    public tags: string;
    public keys: string[];
    public originMessageId: string;
    public retryTopic: string;
    public delayTimeLevel: number;
    public waitStoreMsgOK: boolean;
    public buyerId: string;

    public msgId: string | null;
    public body: string | Buffer;
    public topic: string;
    public queueId: string | null;
    public properties: {
        [key: string]: any;
    };
    public flag: number;
}

declare class Producer extends EventEmitter {
    constructor(options: Producer.ProducerOptions);
    init(): Promise<void>;
    close(): Promise<void>;
    updateTopicPublishInfo(topic: string, info: object): void;
    isPublishTopicNeedUpdate(topic: string): boolean;
    send(msg: Message): Promise<Producer.SendResult>;
    sendMessageInTransaction(msg: Message, tranExecuter: Function, arg?: any): Promise<Producer.SendResult>;
    endTransaction(sendResult: Producer.SendResult, localTransactionState: string, localException?: any): Promise<any>;
    ready(): Promise<void>;
}

declare class Consumer extends EventEmitter {
    constructor(options: Consumer.ComsumerOptions);
    init(): Promise<void>;
    close(): Promise<void>;
    subscribe(topic: string, subExpression: string, handler: Function): void;
    buildSubscriptionData(consumerGroup: string, topic: string, tag: string): object;
    updateTopicSubscribeInfo(topic: string, info: any[]): void;
    isSubscribeTopicNeedUpdate(topic: string): boolean;
}

interface BaseOptions {
    accessKey: string;
    secretKey: string;
    topic: string;
    onsAddr?: string;
    instanceName?: string;
    pollNameServerInteval?: number;
    heartbeatBrokerInterval?: number;
    persistConsumerOffsetInterval?: number;
    rebalanceInterval?: number;
    clientIP?: string;
    unitMode?: boolean;
    onsChannel?: string;
    [key: string]: any;
}

declare namespace Producer {
    export interface ProducerOptions extends BaseOptions {
        logger?: any;
        producerGroup: string;
        createTopicKey?: string;
        defaultTopicQueueNums?: number;
        sendMsgTimeout?: number;
        compressMsgBodyOverHowmuch?: number;
        retryTimesWhenSendFailed?: number;
        retryAnotherBrokerWhenNotStoreOK?: boolean;
        maxMessageSize?: number;
        connectTimeout?: number;
    }

    export interface SendResult {
        sendStatus: SendStatus;
        msgId: string;
        messageQueue: any;
        queueOffset: number;
        transactionId?: number;
        localTransactionState?: string;
    }
}

declare namespace Consumer {
    export interface ComsumerOptions extends BaseOptions {
        logger?: any;
        persistent?: boolean // 是否持久化消费进度
        isBroadcast?: boolean; // 是否是广播模式（默认集群消费模式）
        brokerSuspendMaxTimeMillis?: number; // 长轮询模式，Consumer连接在Broker挂起最长时间
        pullTimeDelayMillsWhenException?: number; // 拉消息异常时，延迟一段时间再拉
        pullTimeDelayMillsWhenFlowControl?: number; // 进入流控逻辑，延迟一段时间再拉
        consumerTimeoutMillisWhenSuspend?: number; // 长轮询模式，Consumer超时时间（必须要大于brokerSuspendMaxTimeMillis）
        consumerGroup: string;
        consumeFromWhere?: string; // Consumer第一次启动时，从哪里开始消费
        /**
         * Consumer第一次启动时，如果回溯消费，默认回溯到哪个时间点，数据格式如下，时间精度秒：
         * 20131223171201
         * 表示2013年12月23日17点12分01秒
         * 默认回溯到相对启动时间的半小时前
         */
        consumeTimestamp?: number;
        pullThresholdForQueue?: number; // 本地队列消息数超过此阀值，开始流控
        pullInterval?: number; // 拉取消息的频率, 如果为了降低拉取速度，可以设置大于0的值
        consumeMessageBatchMaxSize?: number; // 消费一批消息，最大数
        pullBatchSize?: number; // 拉消息，一次拉多少条
        parallelConsumeLimit?: number; // 并发消费消息限制
        postSubscriptionWhenPull?: boolean; // 是否每次拉消息时，都上传订阅关系
        allocateMessageQueueStrategy?: any; // 队列分配算法，应用可重写
        maxReconsumeTimes?: number; // 最大重试次数
    };
}

export { Message, Producer, Consumer };