import {
  Create as CreateEvent,
  Fund as FundEvent,
  StateChanged as StateChangedEvent
} from "../generated/CrowdfundV1/CrowdfundV1"
import { Assignment, Campaign, CampaignFund } from "../generated/schema"

enum State {
  PENDING,
  EXECUTED,
  CONFIRMED,
  REFUNDED
}

export function handleCreate(event: CreateEvent): void {
  let entity = new Campaign(event.params.campaignId.toString())

  entity.creator = event.params.creator
  entity.title = event.params.title
  entity.description = event.params.description
  entity.state = 'PENDING'

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

export function handleStateChanged(event: StateChangedEvent): void {
  let entity = new Campaign(event.params.campaignId.toString())
  const state = event.params.state

  switch (state) {
    case State.EXECUTED:
      entity.state = 'EXECUTED'
      break;
    case State.REFUNDED:
      entity.state = 'REFUNDED'
      break;
    case State.CONFIRMED:
      entity.state = 'CONFIRMED'
      break;
    default:
      break;
  }

  entity.save()
}
