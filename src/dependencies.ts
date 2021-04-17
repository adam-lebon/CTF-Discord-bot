import { Container, decorate, injectable, unmanaged } from "inversify";
import { Logger } from "tslog";
import { ChannelService } from "./services/Channel.service";
import { TeamService } from "./services/Team.service";

const DIContainer = new Container();

decorate(injectable(), Logger);
decorate(unmanaged(), Logger, 0);
decorate(unmanaged(), Logger, 1);
DIContainer.bind<Logger>(Logger).toSelf();
DIContainer.bind<ChannelService>(ChannelService).toSelf();
DIContainer.bind<TeamService>(TeamService).toSelf();

export default DIContainer;
