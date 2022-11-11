import {SsgStep, SsgStepResult} from "./SsgStep"
import {SsgConfig} from "../Ssg"
import {SsgContext} from "../SsgContext"
import {dirNames} from "../util/file/FileUtil"
import {getFileInfo, getOrCreateFileInfo} from "../util/file/FileInfo"

export interface DirectoryResult extends SsgStepResult {
  directoryCount: number
}

/**
 * A step to enrich a template from some subdirectories processing.
 *
 * A typical use case is to generate an index page from subdirectories.
 */
export abstract class DirectoryStep implements SsgStep<DirectoryResult> {

  constructor(protected dirs: string[], protected excludedDirs: string[], protected template: string,
              protected config: SsgConfig, readonly name = "directory") {
  }

  async execute(context: SsgContext): Promise<SsgStepResult> {
    context.inputFile = getFileInfo(context, this.template)
    context.outputFile = getOrCreateFileInfo(context, `${this.config.outDir}/${this.template}`)
    let dirames = (await this.findDirs(this.dirs))
      .filter(dirName => !this.excludedDirs.includes(dirName))
    await this.processDirs(context, dirames)
    return {directoryCount: dirames.length}
  }

  protected abstract processDirs(context: SsgContext, dirames: string[]): Promise<void>

  private async findDirs(fromDirs: string[]) {
    let dirames: string[] = []
    for (let fromDir of fromDirs) {
      let subDirs: string[] = []
      if (fromDir.endsWith("/*/")) {
        const baseDir = fromDir.substring(0, fromDir.length - 3)
        if (baseDir.endsWith("/*")) {
          const dirs = (await this.findDirs([baseDir + "/"]))
            .filter(dirName => !this.excludedDirs.includes(dirName))
          for (const dir of dirs) {
            subDirs = subDirs.concat(await this.findDirs([dir + "/*/"]))
          }
        } else {
          subDirs = (await dirNames(baseDir)).map(x => baseDir + "/" + x)
        }
      } else {
        subDirs = [fromDir]
      }
      dirames = dirames.concat(subDirs)
    }
    return dirames
  }
}
