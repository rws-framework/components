import { RWSUploader } from './components/rws/uploader/component';
import { RWSProgress } from './components/rws/progress/component';
import { RWSLoader } from './components/rws/loader/component';
import { RWSApiResource } from './components/rws/rws-api-resource/component';
import { ReFormer } from './components/rws/reformer/component';
import { RWSTable } from './components/rws/rws-table/component';
import { RWSModal } from './components/rws/rws-modal/component';
import { LineSplitter } from './components/rws/line-splitter/component';

function declareRWSComponents(parted: boolean = false): void
{
    if(!parted){
        RWSUploader;        
        RWSProgress;
        RWSLoader;
        RWSTable;
        RWSModal;
        LineSplitter;

        RWSApiResource;
        ReFormer;
    }
}

export { declareRWSComponents };