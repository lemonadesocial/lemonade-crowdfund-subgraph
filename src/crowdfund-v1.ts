import { BigInt } from "@graphprotocol/graph-ts"

import {
  Create as CreateEvent,
  Fund as FundEvent,
  StateChanged as StateChangedEvent,
} from "../generated/CrowdfundV1/CrowdfundV1"
import { Assignment, Campaign, CampaignFund, CampaignContributor } from "../generated/schema"

enum State {
  PENDING,
  EXECUTED,
  CONFIRMED,
  REFUNDED
}

export function handleCreate(event: CreateEvent): void {
  let entity = new Campaign(
    event.address.toHexString() + '_' + event.params.campaignId.toString()
  )

  entity.creator = event.params.creator
  entity.title = event.params.title
  entity.description = event.params.description
  entity.state = 'PENDING'
  entity.totalFunded = BigInt.fromI32(0)

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
  let campaign = Campaign.load(
    event.address.toHexString() + '_' + event.params.campaignId.toString()
  )
  let campaignContributor = CampaignContributor.load(event.params.contributor)

  if (!campaign) return;

  campaign.totalFunded = campaign.totalFunded.plus(event.params.amount)

  if (campaignContributor) {
    campaignContributor.counter += 1
  } else {
    campaignContributor = new CampaignContributor(event.params.contributor)
    campaignContributor.campaign = campaign.id
    campaignContributor.counter = 1
  }

  entity.campaign = event.params.campaignId.toString()
  entity.amount = event.params.amount
  entity.contributor = event.params.contributor

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
  campaign.save()
  campaignContributor.save()
}

export function handleStateChanged(event: StateChangedEvent): void {
  let entity = Campaign.load(
    event.address.toHexString() + '_' + event.params.campaignId.toString()
  )

  if (!entity) return;

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
