import {
  Create as CreateEvent,
  Execute as ExecuteEvent,
  Fund as FundEvent,
  Refund as RefundEvent
} from "../generated/CrowdfundV1/CrowdfundV1"
import { Assignment, Campaign, CampaignFund, CampaignRefund } from "../generated/schema"

export function handleCreate(event: CreateEvent): void {
  let entity = new Campaign(event.params.campaignId.toString())

  entity.creator = event.params.creator
  entity.title = event.params.title
  entity.description = event.params.description
  entity.executed = false

  let assignments = event.params.assignments
  for (let i = 0; i < assignments.length; i++) {
    let assignment = new Assignment(i.toString())
    assignment.campaign = entity.id
    assignment.to = assignments[i].to
    assignment.count = assignments[i].count

    assignment.save()
  }

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleExecute(event: ExecuteEvent): void {
  let entity = Campaign.load(event.params.campaignId.toString())

  if (!entity) return;

  entity.executed = true;

  entity.save()
}

export function handleFund(event: FundEvent): void {
  let entity = new CampaignFund(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.campaign = event.params.campaignId.toString()
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRefund(event: RefundEvent): void {
  let entity = new CampaignRefund(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.campaign = event.params.campaignId.toString()

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
}
